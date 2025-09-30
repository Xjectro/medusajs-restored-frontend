import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { generateMeta } from "@/utils/meta/generate-meta"
import { retrieveCart } from "@/utils/data/cart"
import { listRegions } from "@/utils/data/regions"
import { retrieveCustomer } from "@/utils/data/customer"

import { LanguageSelect } from "@/components/features/account/selects/language-select"
import { Label } from "@/components/ui/primitives/label"
import { CountrySelect } from "@/components/features/account/selects/country-select"
import { Input } from "@/components/ui/primitives/input"
import { Separator } from "@/components/ui/primitives/separator"

type Props = {
  params: Promise<{
    countryCode: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { countryCode } = await params
  const t = await getTranslations("pages.account.region.meta")

  return generateMeta({
    meta: {
      title: t("title"),
      description: t("description"),
    },
    slug: [countryCode, "account", "region"],
  })
}

export default async function RegionPage({ params }: Props) {
  const { countryCode } = await params
  const t = await getTranslations("pages.account.region.content")
  const customer = await retrieveCustomer()
  const regions = await listRegions()
  const cart = await retrieveCart()

  if (!customer || !regions) {
    notFound()
  }

  const region = regions.find((r) =>
    r.countries?.some((c) => c.iso_2 == countryCode)
  )

  function getCurrencyWithSymbol(code: string) {
    const formatted = (1).toLocaleString("tr-TR", {
      style: "currency",
      currency: code.toUpperCase(),
      currencyDisplay: "symbol",
    })

    const symbol = formatted.replace(/[0-9\s.,]/g, "").trim()

    return `${code.toUpperCase()} (${symbol})`
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <h1 className="sr-only lg:not-sr-only text-lg">{t("title")}</h1>
      <Separator className="my-5 hidden lg:block" />
      <div className="flex flex-col gap-y-8 w-full max-w-xl">
        <div className="grid gap-2">
          <Label htmlFor="country">{t("label.country")}</Label>
          <CountrySelect id="country" regions={regions} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="language">{t("label.language")}</Label>
          <LanguageSelect id="language" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency">{t("label.currency")}</Label>
          <Input
            id="currency"
            value={getCurrencyWithSymbol(
              cart?.currency_code || region?.currency_code || "USD"
            )}
            className="uppercase pointer-events-none"
            size="lg"
          />
        </div>
      </div>
    </div>
  )
}
