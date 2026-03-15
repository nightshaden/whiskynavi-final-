import { OrderResponseOrderStatus } from "@/apis/generated/api";

export const ORDER_STATUS_MAP: Record<
  string,
  { label: string; colorClass: string }
> = {
  [OrderResponseOrderStatus.ORDER_REQUESTED]: {
    label: "주문 접수",
    colorClass: "border-yellow-600/30 bg-yellow-600/20 text-yellow-400",
  },
  [OrderResponseOrderStatus.PAYMENT_PENDING]: {
    label: "결제 대기",
    colorClass: "border-orange-600/30 bg-orange-600/20 text-orange-400",
  },
  [OrderResponseOrderStatus.ORDER_PREPARING]: {
    label: "준비 중",
    colorClass: "border-blue-600/30 bg-blue-600/20 text-blue-400",
  },
  [OrderResponseOrderStatus.SHIPPING]: {
    label: "배송중",
    colorClass: "border-blue-600/30 bg-blue-600/20 text-blue-400",
  },
  [OrderResponseOrderStatus.DELIVERY_COMPLETED]: {
    label: "배송완료",
    colorClass: "border-green-600/30 bg-green-600/20 text-green-400",
  },
  [OrderResponseOrderStatus.RECEIPT_PENDING]: {
    label: "수령 대기",
    colorClass: "border-purple-600/30 bg-purple-600/20 text-purple-400",
  },
  [OrderResponseOrderStatus.RECEIPT_COMPLETED]: {
    label: "수령완료",
    colorClass: "border-green-600/30 bg-green-600/20 text-green-400",
  },
  [OrderResponseOrderStatus.ORDER_CANCELED]: {
    label: "주문 취소",
    colorClass: "border-red-600/30 bg-red-600/20 text-red-400",
  },
  [OrderResponseOrderStatus.REFUND_REQUESTED]: {
    label: "환불 요청",
    colorClass: "border-red-600/30 bg-red-600/20 text-red-400",
  },
  [OrderResponseOrderStatus.REFUND_COMPLETED]: {
    label: "환불 완료",
    colorClass: "border-gray-600/30 bg-gray-600/20 text-gray-400",
  },
};

export const CANCELABLE_STATUSES = [
  OrderResponseOrderStatus.ORDER_REQUESTED,
  OrderResponseOrderStatus.PAYMENT_PENDING,
] as const;

export const MEMBERSHIP_ROLE = {
  NAVI: "ROLE_WHISKYNAVI_MEMBER",
  TALES: "ROLE_WHISKYTALES_MEMBER",
} as const;

export const MEMBERSHIP_INFO = {
  navi: {
    name: "위스키내비",
    subtitle: "WHISKY NAVI",
    badgeLabel: "NAVI",
    benefits: [
      "싱글 캐스크 신제품 우선 구매",
      "연 2회 증류소 탐방 이벤트 참여",
      "멤버 전용 테이스팅 노트 제공",
    ],
    joinMessage: "프리미엄 멤버십에 가입하시면\n특별한 혜택을 누리실 수 있습니다.",
  },
  tales: {
    name: "더 위스키테일즈",
    subtitle: "THE WHISKY TALES",
    badgeLabel: "TALES",
    benefits: [
      "스토리텔링 콘텐츠 무제한 열람",
      "구매시 5% 추가 할인",
      "월간 큐레이션 추천",
      "특별 이벤트 초대",
    ],
    joinMessage: "TALES 멤버십에 가입하시면\n특별한 혜택을 누리실 수 있습니다.",
  },
  notice: [
    "위스키내비: 엄선된 싱글 캐스크 위스키를 우선 구매할 수 있는 프리미엄 멤버십",
    "더 위스키테일즈: 구매 및 활동에 따라 레벨이 상승하는 성장형 멤버십 (LV.1~5)",
    "두 멤버십 모두 가입 가능하며, 각각의 혜택을 함께 누릴 수 있습니다.",
  ],
} as const;

export const FAQ_DATA = [
  {
    question: "주문은 어떻게 하나요?",
    answer:
      "아카이브 페이지에서 원하는 보틀을 선택하고 구매하기 버튼을 클릭하시면 주문이 가능합니다.",
  },
  {
    question: "배송은 얼마나 걸리나요?",
    answer:
      "주문 후 영업일 기준 2-3일 내에 배송됩니다. 일부 제품은 재고 상황에 따라 시간이 더 소요될 수 있습니다.",
  },
  {
    question: "멤버십 등급은 어떻게 올리나요?",
    answer:
      "구매 금액에 따라 자동으로 등급이 상승됩니다. SILVER(50만원), GOLD(100만원), PLATINUM(200만원)입니다.",
  },
  {
    question: "환불은 어떻게 하나요?",
    answer:
      "제품 수령 후 7일 이내 미개봉 상태에서 환불이 가능합니다. 고객센터로 문의해주세요.",
  },
];

