import { getTranslations } from "next-intl/server"

import { generateMeta } from "@/utils/meta/generate-meta"

import { Button } from "@/components/ui/primitives/button"
import { LocalizedClientLink } from "@/components/i18n/client-link"

export async function generateMetadata() {
  const t = await getTranslations("pages.not_found.meta")
  return generateMeta({
    meta: {
      title: t("title"),
      description: t("message"),
    },
  })
}

export default async function NotFound() {
  const t = await getTranslations("pages.not_found.content")
  return (
    <div className="flex flex-col gap-4 items-center justify-center min-h-[calc(100vh-64px)]">
      <h1 className="text-3xl font-medium text-foreground">{t("title")}</h1>
      <p className="text-sm text-foreground">{t("message")}</p>
      <LocalizedClientLink href="/">
        <Button size="lg">{t("button")}</Button>
      </LocalizedClientLink>
    </div>
  )
}
