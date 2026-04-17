import { generateMetadata as genMeta } from "@/config/site"
import ItemConsStockPOPageClient from "./item-cons-stock-po-page-client"

export const metadata = genMeta("Item Cons Stock PO")

export default function ItemConsStockPOPage() {
  return <ItemConsStockPOPageClient />
}
