import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, BriefcaseBusiness, Globe2, GraduationCap, RotateCcw, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

const welcome: Message = {
  role: "assistant",
  content: "Bonjour, je suis **ICX Intelligence**. Décrivez votre situation, votre objectif ou votre question. Je peux vous aider à comparer des options, préparer une démarche et identifier la prochaine action utile avec ICX.",
};

const intents = [
  { label: "Études & admissions", prompt: "Je veux étudier à l’international. Aide-moi à comparer les pays, les programmes et les documents nécessaires.", icon: GraduationCap },
  { label: "Entreprise & stratégie", prompt: "J’ai un projet d’entreprise international. Aide-moi à clarifier le besoin, les risques et les prochaines étapes.", icon: BriefcaseBusiness },
  { label: "Sourcing & commerce", prompt: "Je cherche un fournisseur ou un partenaire commercial. Donne-moi une méthode de qualification et les documents à prévoir.", icon: Globe2 },
  { label: "RH & mobilité", prompt: "Je souhaite recruter ou organiser une mobilité internationale. Par quoi commencer et quelles informations préparer ?", icon: UsersRound },
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const chat = trpc.ai.chat.useMutation({
    onSuccess: response => setMessages(current => [...current, { role: "assistant", content: response.content }]),
    onError: () => toast.error("L’assistant est momentanément indisponible. Réessayez ou contactez ICX directement."),
  });

  const handleSend = (content: string) => {
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    chat.mutate({ messages: nextMessages.filter(message => message.role !== "system").map(message => ({ role: message.role as "user" | "assistant", content: message.content })) });
  };

  return <div className="min-h-screen bg-[#171c1a] text-[#edf0e9]"><header className="border-b border-white/10 bg-[#1b211e]/90 backdrop-blur-xl"><div className="container flex h-[74px] items-center justify-between"><Link href="/" className="flex items-center gap-3"><span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white"><img src="/manus-storage/Logo_5e7a0be8.png" alt="ICX Power Solutions SRL" className="size-full object-cover" /></span><span className="text-xs font-bold uppercase tracking-[0.18em] text-[#edf0e9]">ICX Intelligence</span></Link><div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => setMessages([welcome])} className="text-[#a4afa5] hover:bg-white/10 hover:text-white" aria-label="Nouvelle conversation"><RotateCcw className="size-4" /></Button><Button asChild variant="outline" className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"><Link href="/"><ArrowLeft />Retour au portail</Link></Button></div></div></header><main className="container grid max-w-4xl gap-6 py-6 lg:grid-cols-[.92fr_1.08fr] lg:py-8"><section className="flex max-w-lg flex-col justify-center"><span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200"><Sparkles className="size-3.5" />Assistant indépendant</span><h1 className="mt-5 max-w-lg text-4xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-5xl">Une réponse claire pour chaque décision internationale.</h1><p className="mt-5 max-w-md text-base leading-7 text-[#b8c1b8]">ICX Intelligence traite vos questions, clarifie les options et vous guide vers le bon service ou la bonne prochaine étape.</p><div className="mt-6 space-y-2.5 text-sm text-[#b8c1b8]"><div className="flex items-center gap-3"><Globe2 className="size-4 text-amber-300" />Réponses multilingues et contextualisées</div><div className="flex items-center gap-3"><ShieldCheck className="size-4 text-amber-300" />Limites et informations à confirmer clairement signalées</div><div className="flex items-center gap-3"><Sparkles className="size-4 text-amber-300" />Une recommandation concrète à chaque échange</div></div><div className="mt-7 grid gap-2 sm:grid-cols-2">{intents.map(({ label, prompt, icon: Icon }) => <button key={label} onClick={() => handleSend(prompt)} disabled={chat.isPending} className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left text-sm font-semibold text-[#dbe3d9] transition hover:-translate-y-0.5 hover:border-amber-300/50 hover:bg-amber-300/10 disabled:opacity-50"><span className="grid size-9 place-items-center rounded-xl bg-amber-300/10 text-amber-200"><Icon className="size-4" /></span><span>{label}</span></button>)}</div></section><section className="mx-auto w-full max-w-[540px] rounded-[1.35rem] border border-white/10 bg-[#202824] p-1.5 shadow-2xl shadow-black/25"><AIChatBox messages={messages} onSendMessage={handleSend} isLoading={chat.isPending} height="min(520px, calc(100vh - 132px))" className="overflow-hidden rounded-[1.1rem] border-white/10 bg-[#fdfcf8]" placeholder="Décrivez votre question ou votre situation..." emptyStateMessage="Votre copilote ICX est prêt." suggestedPrompts={["Quelles sont les étapes pour étudier en France ?", "Comment structurer un projet de sourcing ?", "De quels documents ai-je besoin pour commencer ?"]} /></section></main></div>;
}
