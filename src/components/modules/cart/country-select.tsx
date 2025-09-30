import { useMemo } from "react"
import { useTranslations } from "next-intl"
import ReactCountryFlag from "react-country-flag"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select"

import type { ComponentProps } from "react"
import type { HttpTypes } from "@medusajs/types"

type Props = ComponentProps<typeof Select> & {
  region?: HttpTypes.StoreRegion
  placeholder?: string
  defaultValue?: string
}

function CountrySelect({ placeholder, region, ...props }: Props) {
  const t = useTranslations("modules.cart.country_select")

  const countryOptions = useMemo(() => {
    if (!region) {
      return []
    }

    return region.countries?.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    }))
  }, [region])

  return (
    <Select {...props}>
      <SelectTrigger size="lg" className="w-full">
        <SelectValue placeholder={placeholder ?? t("placeholder")} />
      </SelectTrigger>
      <SelectContent>
        {countryOptions?.map(({ value, label }, index) => (
          <SelectItem key={index} value={value || ""}>
            <ReactCountryFlag
              svg
              className="w-5 h-5"
              countryCode={value ?? ""}
            />
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { CountrySelect }
export type { Props as CountrySelectProps }
