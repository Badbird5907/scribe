import { providers } from "@/lib/stores/settings";
import { useMemo } from "react";

export default function ModelDetailsCard({ provider, model }: { provider: string | undefined, model: string | undefined }) {
  const details = useMemo(() => {
    if (!provider || !model) return {
      provider,
      model,
      name: model,
      description: "No description",
      logo: undefined
    }
    const providerObj = providers[provider];
    if (!providerObj) return {
      provider,
      model,
      name: model,
      description: "No description",
      logo: undefined
    }
    const modelObj = providerObj.models[model];
    if (!modelObj) return {
      provider,
      model,
      name: model,
      description: "No description",
      logo: undefined
    }
    return {
      provider: providerObj.name,
      model: modelObj.name,
      description: modelObj.description,
      logo: providerObj.logo
    }
  }, [provider, model]);

  const Logo = details.logo;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {Logo && <Logo className="h-4 w-4" />}
          <p className="text-sm text-muted-foreground">{details.provider}</p>
        </div>
        <p className="text-sm font-medium">{details.model}</p>
        {details.description &&
          <p className="text-sm text-muted-foreground">{details.description}</p>}
      </div>
    </div>
  )
}