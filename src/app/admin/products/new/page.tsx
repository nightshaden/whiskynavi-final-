import { getApiAdminBottlesParameters } from "@/apis/generated/api";
import { withToken } from "@/apis/mutator";
import { getAuthToken } from "@/lib/auth";
import ProductCreateContent from "./_components/ProductCreateContent";

export default async function ProductCreatePage() {
  const token = await getAuthToken();
  const parameterValuesRes = await getApiAdminBottlesParameters(withToken(token));

  return <ProductCreateContent parameterValues={parameterValuesRes.data} />;
}
