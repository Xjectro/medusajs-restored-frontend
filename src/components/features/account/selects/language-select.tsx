"use client"

import i18n from "@/i18n"
import { useLocale } from "next-intl"
import { setCookie } from "cookies-next"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select"
import ReactCountryFlag from "react-country-flag"

import type { ComponentProps } from "react"

function LanguageSelect(props: ComponentProps<typeof SelectTrigger>) {
  const locale = useLocale()

  function handleChange(locale: string) {
    setCookie("NEXT_LOCALE", locale)
    window.location.reload()
  }

  return (
    <Select defaultValue={locale} onValueChange={handleChange}>
      <SelectTrigger size="lg" className="w-full" {...props}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {i18n.locales.map((locale) => (
          <SelectItem value={locale.code} key={locale.code}>
            <ReactCountryFlag
              svg
              className="w-5 object-cover rounded-full aspect-square h-5"
              countryCode={locale?.iso_2}
            />
            {locale.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { LanguageSelect }
