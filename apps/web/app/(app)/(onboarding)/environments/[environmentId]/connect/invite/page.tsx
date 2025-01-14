import { InviteOrganizationMember } from "@/app/(app)/(onboarding)/environments/[environmentId]/connect/components/InviteOrganizationMember";
import { authOptions } from "@/modules/auth/lib/authOptions";
import { Button } from "@/modules/ui/components/button";
import { Header } from "@/modules/ui/components/header";
import { XIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { getMembershipByUserIdOrganizationId } from "@formbricks/lib/membership/service";
import { getOrganizationByEnvironmentId } from "@formbricks/lib/organization/service";

interface InvitePageProps {
  params: Promise<{
    environmentId: string;
  }>;
}

const Page = async (props: InvitePageProps) => {
  const params = await props.params;
  const t = await getTranslations();
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return redirect(`/auth/login`);
  }
  const organization = await getOrganizationByEnvironmentId(params.environmentId);
  if (!organization) {
    throw new Error("Organization not Found");
  }

  const membership = await getMembershipByUserIdOrganizationId(session.user.id, organization.id);
  if (!membership || (membership.role !== "owner" && membership.role !== "manager")) {
    return notFound();
  }

  return (
    <div className="flex min-h-full min-w-full flex-col items-center justify-center">
      <Header
        title={t("environments.connect.invite.headline")}
        subtitle={t("environments.connect.invite.subtitle")}
      />
      <div className="space-y-4 text-center">
        <p className="text-4xl font-medium text-slate-800"></p>
        <p className="text-sm text-slate-500"></p>
      </div>
      <InviteOrganizationMember organization={organization} environmentId={params.environmentId} />
      <Button
        className="absolute right-5 top-5 !mt-0 text-slate-500 hover:text-slate-700"
        variant="minimal"
        href={`/environments/${params.environmentId}/`}>
        <XIcon className="h-7 w-7" strokeWidth={1.5} />
      </Button>
    </div>
  );
};

export default Page;
