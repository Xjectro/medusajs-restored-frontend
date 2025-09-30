import { notFound } from "next/navigation"
import { cookies as nextCookies } from "next/headers"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/primitives/button"
import { resetOnboardingState } from "@/utils/data/onboarding"
import { CartTotals } from "@/components/features/cart/cart-totals"

import { retrieveOrder } from "@/utils/data/orders"
import { generateMeta } from "@/utils/meta/generate-meta"
import { paymentInfoMap } from "@/constants/client-data"
import { isStripe } from "@/lib/type-guard"
import { convertToLocale } from "@/utils/helpers/math"
import { repeat } from "@/lib/utils"

import { Separator } from "@/components/ui/primitives/separator"
import { Table, TableBody } from "@/components/ui/primitives/table"
import { CartItem } from "@/components/features/cart/cart-item"
import { SkeletonLineItem } from "@/components/modules/skeleton/table-line-item"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/primitives/card"
import { Alert, AlertDescription } from "@/components/ui/primitives/alert"

import type { StoreCartLineItem } from "@medusajs/types"

type Props = {
  params: Promise<{ id: string; countryCode: string }>
}

export async function generateMetadata({ params }: Props) {
  const { countryCode, id } = await params
  const t = await getTranslations("pages.order.confirmed.meta")

  return generateMeta({
    meta: {
      title: t("title"),
      description: t("description"),
    },
    slug: [countryCode, "order", id, "confirmed"],
  })
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)
  const t = await getTranslations("pages.order.confirmed")

  if (!order) {
    return notFound()
  }

  const payment = order.payment_collections?.[0].payments?.[0]

  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="py-6 min-h-[calc(100vh-64px)] w-full">
      <div className="container flex flex-col justify-center items-center gap-y-10 h-full w-full">
        {isOnboarding && (
          <div className="flex flex-col gap-y-4 center p-4 md:items-center">
            <p className="text-foreground text-xl">
              Your test order was successfully created! 🎉
            </p>
            <p className="text-foreground text-sm">
              You can now complete setting up your store in the admin.
            </p>
            <Button
              className="w-fit"
              size="xl"
              onClick={() => resetOnboardingState(order.id)}
            >
              Complete setup in admin
            </Button>
          </div>
        )}
        <div
          className="flex flex-col h-full bg-background w-full py-10"
          data-testid="order-complete-container"
        >
          <h1 className="flex flex-col gap-y-3 text-foreground text-3xl mb-5">
            <span className="flex items-center gap-1">
              #{order.display_id} {t("content.title")}
            </span>
            <span> {t("content.description")}</span>
          </h1>
          <Alert variant="secondary">
            <AlertDescription>
              {t("content.email_send_message", { email: order.email || "" })}
            </AlertDescription>
          </Alert>
          <Alert variant="success">
            <AlertDescription>
              {t("content.created_message", {
                date: new Date(order.created_at).toDateString(),
              })}
            </AlertDescription>
          </Alert>
          <Separator className="my-10" />
          <h2 className="flex flex-row text-xl lg:text-2xl font-medium mb-5">
            {t("label.summary")}
          </h2>
          <div className="mb-5">
            <Table>
              <TableBody data-testid="products-table">
                {order.items?.length
                  ? order.items
                      .sort((a, b) => {
                        return (a.created_at ?? "") > (b.created_at ?? "")
                          ? -1
                          : 1
                      })
                      .map((item) => {
                        return (
                          <CartItem
                            key={item.id}
                            item={item as unknown as StoreCartLineItem}
                            type="preview"
                            currencyCode={order.currency_code}
                          />
                        )
                      })
                  : repeat(5).map((i) => {
                      return <SkeletonLineItem key={i} />
                    })}
              </TableBody>
            </Table>
          </div>
          <CartTotals variant="card" totals={order} />

          <Separator className="my-10" />

          <h2 className="flex flex-row text-xl lg:text-2xl font-medium mb-5">
            {t("label.delivery")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <Card
              data-testid="shipping-address-summary"
              variant="secondary"
              className="w-full"
            >
              <CardHeader>
                <CardTitle>{t("label.shipping_address")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-foreground">
                  {order.shipping_address?.first_name}{" "}
                  {order.shipping_address?.last_name}
                </p>
                <p className="font-medium text-foreground">
                  {order.shipping_address?.address_1}{" "}
                  {order.shipping_address?.address_2}
                </p>
                <p className="font-medium text-foreground">
                  {order.shipping_address?.postal_code},{" "}
                  {order.shipping_address?.city}
                </p>
                <p className="font-medium text-foreground">
                  {order.shipping_address?.country_code?.toUpperCase()}
                </p>
              </CardContent>
            </Card>

            <Card
              data-testid="shipping-contact-summary"
              variant="secondary"
              className="w-full"
            >
              <CardHeader>
                <CardTitle>{t("label.contact")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-foreground">
                  {order.shipping_address?.phone}
                </p>
                <p className="font-medium text-foreground">{order.email}</p>
              </CardContent>
            </Card>

            <Card
              data-testid="shipping-method-summary"
              variant="secondary"
              className="w-full"
            >
              <CardHeader>
                <CardTitle>{t("label.method")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-foreground">
                  {(order as any).shipping_methods[0]?.name} (
                  {convertToLocale({
                    amount: order.shipping_methods?.[0].total ?? 0,
                    currency_code: order.currency_code,
                  })
                    .replace(/,/g, "")
                    .replace(/\./g, ",")}
                  )
                </p>
              </CardContent>
            </Card>
          </div>
          <Separator className="my-10" />

          <h2 className="flex flex-row text-xl lg:text-2xl font-medium mb-5">
            {t("label.payment")}
          </h2>
          <div>
            {payment && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Card variant="secondary" className="w-full">
                  <CardHeader>
                    <CardTitle> {t("label.payment_method")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className="font-medium text-foreground"
                      data-testid="payment-method"
                    >
                      {paymentInfoMap[payment.provider_id].title}
                    </p>
                  </CardContent>
                </Card>
                <Card variant="secondary" className="w-full">
                  <CardHeader>
                    <CardTitle> {t("label.payment_details")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="flex items-center h-7 w-fit p-2 bg-background rounded-lg text-foreground">
                      {paymentInfoMap[payment.provider_id].icon}
                    </span>
                    <p data-testid="payment-amount">
                      {isStripe(payment.provider_id) && payment.data?.card_last4
                        ? `**** **** **** ${payment.data.card_last4}`
                        : `${convertToLocale({
                            amount: payment.amount,
                            currency_code: order.currency_code,
                          })} paid at ${new Date(
                            payment.created_at ?? ""
                          ).toLocaleString()}`}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
