import { MailCheck } from "lucide-react";

/** État de confirmation affiché après l'envoi d'un lien magique. */
export function MagicLinkSuccess({ email }: { email: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
        <MailCheck className="size-7" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Vérifiez votre boîte mail</h1>
      <p className="mt-3 text-muted-foreground">
        Nous avons envoyé un lien de connexion à{" "}
        <span className="font-medium text-foreground">{email}</span>. Cliquez dessus pour accéder
        à votre espace.
      </p>
      <p className="mt-6 text-sm text-muted-foreground">
        Pas reçu ? Pensez à vérifier vos spams, ou réessayez dans une minute.
      </p>
    </div>
  );
}
