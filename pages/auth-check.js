import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useRouter } from "next/router";

export default function AuthCheck() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const verifierUtilisateur = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push("/connexion");
      } else {
        setUserInfo(user);
        setTimeout(() => {
          router.push("/");
        }, 500); // délai pour Safari
      }
      setLoading(false);
    };
    verifierUtilisateur();
  }, []);

  if (loading) return <p className="text-center mt-20">Vérification de la session...</p>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-2">Connexion réussie !</h2>
      <pre className="text-sm bg-gray-100 p-4 rounded">
        {JSON.stringify(userInfo, null, 2)}
      </pre>
    </div>
  );
}