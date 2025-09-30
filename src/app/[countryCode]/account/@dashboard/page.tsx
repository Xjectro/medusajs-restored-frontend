import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { retrieveCustomer } from "@/utils/data/customer"
import { listOrders } from "@/utils/data/orders"
import { generateMeta } from "@/utils/meta/generate-meta"

import { Separator } from "@/components/ui/primitives/separator"
import { Avatar, AvatarFallback } from "@/components/ui/primitives/avatar"
import { OrderCard } from "@/components/features/account/cards/order-card"
import { Alert, AlertDescription } from "@/components/ui/primitives/alert"

import type { HttpTypes } from "@medusajs/types"
import { Button } from "@/components/ui/primitives/button"
import { MessageCircleMoreIcon } from "lucide-react"

type Props = {
  params: Promise<{ countryCode: string }>
}

export async function generateMetadata({ params }: Props) {
  const { countryCode } = await params
  const t = await getTranslations("pages.account.overview.meta")

  return generateMeta({
    meta: {
      title: t("title"),
      description: t("description"),
    },
    slug: [countryCode, "account"],
  })
}

export default async function OverviewPage() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null
  const t = await getTranslations("pages.account.overview.content")

  if (!customer) {
    notFound()
  }

  function getProfileCompletion(customer: HttpTypes.StoreCustomer) {
    let count = 0

    if (!customer) {
      return 0
    }

    if (customer.email) {
      count++
    }

    if (customer.first_name && customer.last_name) {
      count++
    }

    if (customer.phone) {
      count++
    }

    const billingAddress = customer.addresses?.find(
      (addr) => addr.is_default_billing
    )

    if (billingAddress) {
      count++
    }

    return (count / 4) * 100
  }

  return (
    <div data-testid="overview-page-wrapper">
      <div className="hidden lg:block">
        <nav className="flex items-center justify-between w-full">
          <div className="flex items-start gap-2">
            <Avatar className="size-12 font-medium">
              <AvatarFallback>{customer.first_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-bold">
                {customer.first_name} {customer.last_name}
              </span>
              <u className="underline-offset-4 text-sm">{t("label.profile")}</u>
            </div>
          </div>
          <Button size="lg" disabled>
            {t("button.support")} <MessageCircleMoreIcon />
          </Button>
        </nav>
        <Separator className="my-5" />
        <div className="flex items-center justify-around mb-6 py-6 bg-secondary rounded-xl">
          <div className="flex flex-col items-center">
            <span
              className="text-xl font-bold leading-none"
              data-testid="customer-profile-completion"
              data-value={getProfileCompletion(customer)}
            >
              {getProfileCompletion(customer)}%
            </span>
            <h3 className="text-base mt-1 text-center">
              {t("label.profile_completing")}
            </h3>
          </div>

          <Separator orientation="vertical" className="!h-14" />

          <div className="flex flex-col items-center">
            <span
              className="text-xl font-bold leading-none"
              data-testid="addresses-count"
              data-value={customer?.addresses?.length || 0}
            >
              {customer?.addresses?.length || 0}
            </span>
            <h3 className="text-base mt-1 text-center">
              {t("label.address_count")}
            </h3>
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          <div className="flex items-center gap-x-2">
            <h3 className="text-lg font-medium">{t("label.recent_orders")}</h3>
          </div>
          <ul className="flex flex-col gap-y-4" data-testid="orders-wrapper">
            {orders && orders.length > 0 ? (
              orders.slice(0, 5).map((order) => {
                return (
                  <li
                    key={order.id}
                    data-testid="order-wrapper"
                    data-value={order.id}
                  >
                    <OrderCard order={order} />
                  </li>
                )
              })
            ) : (
              <Alert data-testid="no-orders-message" variant="destructive">
                <AlertDescription>
                  {t("message.no_recent_order")}
                </AlertDescription>
              </Alert>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
