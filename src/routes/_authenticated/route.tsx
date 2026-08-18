import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/data";
import { guard } from "@/lib/routing";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context, location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const profile = await context.queryClient.ensureQueryData(profileQuery);
    const target = guard(profile, location.pathname);
    if (target) throw redirect({ to: target });

    return { user: data.user, profile };
  },
  component: () => <Outlet />,
});
