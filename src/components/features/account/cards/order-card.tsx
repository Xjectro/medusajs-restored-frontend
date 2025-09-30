import Image from "next/image"
import { useTranslations } from "next-intl"
import {
  BanIcon,
  CheckIcon,
  ChevronRightIcon,
  HourglassIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { convertToLocale } from "@/utils/helpers/math"

import { Button } from "@/components/ui/primitives/button"
import { LocalizedClientLink } from "@/components/i18n/client-link"

import type { HttpTypes } from "@medusajs/types"

type Props = {
  order: HttpTypes.StoreOrder
}

function OrderCard({ order }: Props) {
  const t = useTranslations("features.account.cards.order_card")

  const isPending =
    order.fulfillment_status == "not_fulfilled" ||
    order.fulfillment_status == "partially_fulfilled" ||
    order.fulfillment_status == "partially_shipped" ||
    order.fulfillment_status == "partially_delivered"

  const isSuccess =
    order.fulfillment_status == "fulfilled" ||
    order.fulfillment_status == "shipped" ||
    order.fulfillment_status == "delivered"

  const isCanceled = order.fulfillment_status == "canceled"

  return (
    <LocalizedClientLink
      href={`/account/orders/details/${order.id}`}
      className="flex items-center justify-between w-full border rounded-xl p-4 lg:p-6"
      data-testid="order-card"
    >
      <div className="flex items-center">
        <div className="flex items-center gap-0 w-24">
          {order.items?.slice(0, 2)?.map((i, idx) => (
            <Image
              src={i.thumbnail || ""}
              alt={i.product_title || ""}
              width={100}
              height={100}
              className={cn(
                "border aspect-square w-14 object-cover object-center rounded-full",
                idx === 1 && "-translate-x-8",
                idx === 2 && "-translate-x-16"
              )}
              key={i.id}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 sr-only lg:not-sr-only">
          <span className="text-muted-foreground">{t("order_number")}:</span>
          <span data-testid="order-display-id" className="font-semibold">
            {order.display_id}
          </span>
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-2 font-medium text-sm">
        <span
          className={cn("[&>svg]:size-3 rounded-full p-1 aspect-square", {
            "bg-orange-500 text-white": isPending,
            "bg-green-500 text-white": isSuccess,
            "bg-destructive text-destructive-foreground": isCanceled,
          })}
        >
          {isPending && <HourglassIcon strokeWidth={3} />}
          {isSuccess && <CheckIcon strokeWidth={4} />}
          {isCanceled && <BanIcon strokeWidth={4} />}
        </span>
        {t(`fulfilled_status.${order.fulfillment_status}`)}
      </div>
      <div className="flex items-center gap-10 text-sm lg:text-base">
        <div className="flex flex-col items-end">
          <span
            className="font-medium text-end text-sm"
            data-testid="order-created-at"
          >
            {new Date(order.created_at).toDateString()}
          </span>
          <span
            className="text-green-700 font-semibold"
            data-testid="order-amount"
          >
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
        </div>
        <Button
          data-testid="order-details-link"
          size="icon"
          variant="secondary"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </LocalizedClientLink>
  )
}

export { OrderCard }
