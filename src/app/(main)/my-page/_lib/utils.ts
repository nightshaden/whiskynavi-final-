import { MEMBERSHIP_ROLE, ORDER_STATUS_MAP } from "./constants";

export function getOrderStatusConfig(status?: string) {
  if (!status)
    return {
      label: "알 수 없음",
      colorClass: "border-gray-600/30 bg-gray-600/20 text-gray-400",
    };
  return (
    ORDER_STATUS_MAP[status] ?? {
      label: status,
      colorClass: "border-gray-600/30 bg-gray-600/20 text-gray-400",
    }
  );
}

export function formatCurrency(amount?: number) {
  if (amount == null) return "₩0";
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function hasNaviMembership(roles?: string[]) {
  return roles?.includes(MEMBERSHIP_ROLE.NAVI) ?? false;
}

export function hasTalesMembership(roles?: string[]) {
  return roles?.includes(MEMBERSHIP_ROLE.TALES) ?? false;
}

export function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
