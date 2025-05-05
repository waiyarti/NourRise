import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../supabaseClient";

export default function AuthCheck() {
  const router = useRouter();

  useEffect(() => {
    const verifierConnexion = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Tu peux stocker l'utilisateur en localStorage si besoin
        localStorage.setItem("utilisateurWivya", session.user.email);
        router.push("/"); // redirige vers la page d’accueil
      } else {
        router.push("/connexion"); // renvoie vers la connexion
      }
    };

    verifierConnexion();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="loader" />
    </div>
  );
}