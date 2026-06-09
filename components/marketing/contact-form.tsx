"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { submitContactRequest } from "@/app/(marketing)/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [done, setDone] = React.useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactInput) => {
    const fd = new FormData();
    fd.set("nom", values.nom);
    fd.set("email", values.email);
    fd.set("message", values.message);
    const result = await submitContactRequest(null, fd);
    if (result.success) {
      toast.success(result.message ?? "Message envoyé !");
      reset();
      setDone(true);
    } else {
      toast.error(result.error);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center">
        <CheckCircle2 className="size-12 text-brand" />
        <h3 className="mt-4 text-lg font-semibold">Message bien reçu</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Merci ! Notre équipe vous répondra sous 24 h ouvrées.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-2xl border border-border bg-card p-6 sm:p-8"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="nom">Nom</Label>
        <Input id="nom" placeholder="Jean Dupont" {...register("nom")} aria-invalid={!!errors.nom} />
        {errors.nom && <p className="text-sm text-destructive">{errors.nom.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="jean@monentreprise.fr"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Parlez-nous de votre activité et de votre projet…"
          {...register("message")}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Envoi…" : "Envoyer le message"}
        <Send className="size-4" />
      </Button>
    </form>
  );
}
