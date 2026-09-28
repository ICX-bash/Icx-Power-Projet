import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router, superAdminProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { z } from "zod";
import { addServiceDocument, createPartnershipRequest, createServiceRequest, createUserNotification, getPartnershipRequestsForUser, getServiceDocumentsForUser, getServiceRequestById, getServiceRequestsForUser, getUserNotifications, getWorkflowProgressForUser, saveWorkflowProgress, updateServiceRequestStatus, listUsers, setUserRoleByEmail } from "./db";
import { storagePut } from "./storage";

const icxKnowledgeBase = `Contexte de référence ICX POWER SOLUTIONS SRL : société roumaine basée à Iași, CUI 54675848, Nr. Reg. Com. J2026031336000, CAEN 7020. Services : Expertise internationale, Conseil en entreprise, Sourcing, Ressources humaines, Commerce international, Études & admissions et Immobilier. Parcours portail : chaque sous-service permet de préciser le besoin, répondre à une évaluation courte, puis ouvrir un espace sécurisé pour enregistrer une demande et joindre des documents. Tarification : les prestations sont étudiées sur brief et devis ; ne donne jamais de prix inventé. Documents de départ généralement utiles : identité/passeport, coordonnées, contexte du projet, budget ou calendrier, justificatifs spécifiques au service. Pour les études : le catalogue présente des informations indicatives et la disponibilité, les frais, visas et admissions doivent être confirmés auprès de l’établissement. Pour une entreprise partenaire : demander raison sociale, interlocuteur, email, besoin, pays concernés et objectif de coopération. Ne présente jamais ce contexte comme un contrat, une garantie ou un avis juridique.`;
const expansionKnowledge = `Axes d’expansion à présenter comme des offres en développement ou partenariats à formaliser : réservation de billets d’avion et conseil itinéraire, réservation de chambres d’hôtel en Afrique, conseil et accompagnement touristique, affiliation par liens de redirection vers des produits de différentes marques, et qualification de partenariats pour le développement de sociétés minières en Afrique. Emirates et Turkish Airlines sont des partenaires envisagés à confirmer ; Travelpayourts est un nom fourni par ICX dont l’identité et l’URL doivent être vérifiées. Ne jamais présenter un partenariat, un tarif, une disponibilité de vol/hôtel, une commission d’affiliation ou une opportunité minière comme garanti. Pour les mines, rappeler que les audits techniques, juridiques, environnementaux, sociaux, sécurité et conformité réglementaire doivent être réalisés par des experts qualifiés.`;

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  requests: router({
    mine: protectedProcedure.query(({ ctx }) => getServiceRequestsForUser(ctx.user.id)),
    documents: protectedProcedure.query(({ ctx }) => getServiceDocumentsForUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      serviceKey: z.string().min(2).max(80),
      firstName: z.string().min(1).max(120),
      lastName: z.string().min(1).max(120),
      email: z.string().email(),
      phone: z.string().max(40).optional(),
      country: z.string().max(80).optional(),
      message: z.string().min(5).max(8000),
      attachments: z.array(z.object({ fileName: z.string().min(1).max(255), mimeType: z.string().min(1).max(120), fileSize: z.number().int().positive().max(8_000_000), data: z.string().min(1).max(11_000_000) })).max(5).optional(),
    })).mutation(async ({ ctx, input }) => {
      const attachments = input.attachments || [];
      const result = await createServiceRequest({ serviceKey: input.serviceKey, firstName: input.firstName, lastName: input.lastName, email: input.email, phone: input.phone, country: input.country, message: input.message, attachmentCount: attachments.length, userId: ctx.user.id });
      for (const attachment of attachments) {
        const buffer = Buffer.from(attachment.data, "base64");
        const stored = await storagePut(`${ctx.user.id}-documents/${attachment.fileName}`, buffer, attachment.mimeType);
        await addServiceDocument({ userId: ctx.user.id, requestId: result.id, fileName: attachment.fileName, fileKey: stored.key, fileUrl: stored.url, mimeType: attachment.mimeType, fileSize: attachment.fileSize });
      }
      await createUserNotification({ userId: ctx.user.id, title: "Demande enregistrée", content: `Votre demande pour ${input.serviceKey} a bien été reçue par ICX.` });
      await notifyOwner({ title: "Nouvelle demande ICX", content: `${input.firstName} ${input.lastName} a soumis une demande pour ${input.serviceKey}${attachments.length ? ` avec ${attachments.length} document(s)` : ""}.` });
      return result;
    }),
    updateStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["Reçu", "En cours d’analyse", "Documents complémentaires requis", "Accepté", "Refusé", "Clôturé"]) })).mutation(async ({ ctx, input }) => {
      const result = await updateServiceRequestStatus(input.id, input.status);
      const request = await getServiceRequestById(input.id);
      if (request) await createUserNotification({ userId: request.userId, title: "Statut de demande mis à jour", content: `Votre demande ${request.serviceKey} est maintenant « ${input.status} ».` });
      await notifyOwner({ title: "Statut de demande modifié", content: `${ctx.user.name || "Un administrateur"} a changé le statut de la demande #${input.id} vers « ${input.status} ».` });
      return result;
    }),
  }),

  workflow: router({
    mine: protectedProcedure.query(({ ctx }) => getWorkflowProgressForUser(ctx.user.id)),
    save: protectedProcedure.input(z.object({
      serviceKey: z.string().min(2).max(80),
      need: z.string().min(2).max(180),
      step: z.enum(["detail", "assessment", "auth"]),
      answers: z.string().max(1000).optional(),
    })).mutation(({ ctx, input }) => saveWorkflowProgress({ ...input, userId: ctx.user.id })),
  }),

  partnerships: router({
    mine: protectedProcedure.query(({ ctx }) => getPartnershipRequestsForUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      companyName: z.string().min(2).max(180),
      contactName: z.string().min(2).max(160),
      email: z.string().email(),
      phone: z.string().max(40).optional(),
      needs: z.string().min(10).max(8000),
    })).mutation(async ({ ctx, input }) => {
      const result = await createPartnershipRequest({ ...input, userId: ctx.user.id });
      await notifyOwner({ title: "Nouvelle demande de partenariat", content: `${input.companyName} souhaite étudier un partenariat avec ICX POWER SOLUTIONS SRL.` });
      return result;
    }),
  }),

  notifications: router({
    mine: protectedProcedure.query(({ ctx }) => getUserNotifications(ctx.user.id)),
  }),

  admin: router({
    users: superAdminProcedure.query(() => listUsers()),
    setRole: superAdminProcedure.input(z.object({ email: z.string().email(), role: z.enum(["user", "admin"]) })).mutation(({ input }) => setUserRoleByEmail(input.email.toLowerCase(), input.role)),
  }),

  ai: router({
    chat: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().min(1).max(6000),
        })).min(1).max(20),
      }))
      .mutation(async ({ input }) => {
        const result = await invokeLLM({
          model: "gpt-5",
          reasoning: { effort: "medium" },
          maxTokens: 1200,
          messages: [
            {
              role: "system",
              content: `Tu es ICX Intelligence, l'assistant officiel indépendant d'ICX POWER SOLUTIONS SRL. Tu réponds en français par défaut, mais tu peux répondre en anglais, roumain, polonais, chinois ou arabe si l'utilisateur le demande. Tu traites toutes les demandes avec sérieux et tu aides sur l'expertise internationale, le conseil en entreprise, le sourcing, les ressources humaines, le commerce international, les études/admissions, l'immobilier, la mobilité, les partenaires et l'utilisation du portail. Pour chaque demande, commence par comprendre l'objectif, pose au maximum deux questions de clarification si nécessaire, puis réponds avec une structure lisible : analyse, options, documents ou informations utiles, risques/points à confirmer, prochaine action. Ne fabrique jamais une université, un visa, un prix, une règle légale ou une disponibilité. Quand une information doit être confirmée, indique-le clairement. Pour les demandes sensibles (juridique, santé, finance), donne uniquement des informations générales et recommande un professionnel qualifié. Si la demande concerne ICX, propose une prochaine étape concrète : choisir un service, ouvrir un espace sécurisé, contacter ICX ou commencer une demande.\n\n${icxKnowledgeBase}\n\n${expansionKnowledge}`,
            },
            ...input.messages,
          ],
        });
        const content = result.choices[0]?.message?.content;
        return { content: typeof content === "string" ? content : "Je n'ai pas pu formuler une réponse. Contactez ICX pour un accompagnement direct." };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
