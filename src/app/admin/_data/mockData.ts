// 회원 확장 정보 타입 정의
export interface UserExtInfo {
  privacyAgree: boolean;
  marketingAgree: boolean;
  emailAgree: boolean;
  smsAgree: boolean;
  isBanned: boolean;
  banReason: string | null;
  banStartAt: string | null;
  banEndAt: string | null;
}

// 회원 타입 정의 (AdminUserResponse 기반)
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  whiskeyNaviMembership: "VIP" | "GOLD" | "SILVER" | null;
  whiskeyTalesMembership: "VIP" | "GOLD" | "SILVER" | null;
  status: string;
  roles: string[]; // memberType은 roles로 대체 (예: "ROLE_BUSINESS" = 업장, "ROLE_USER" = 일반)
  createdAt: string; // 계정 생성 일시 (date-time 형식, 예: "2025-01-15T10:00:00Z")
  updatedAt: string; // 계정 최종 수정 일시 (date-time 형식)
  lastLoginAt: string; // 최근 로그인 일시 (date-time 형식)
  userExt: UserExtInfo;
  // 아래 필드들은 AdminUserResponse에 포함되지 않음 - 별도 API에서 조회 필요
  totalOrders: number; // 총 주문 수
  totalSpent: number; // 총 지출 금액
  socialConnections: { google: boolean; kakao: boolean; naver: boolean }; // 소셜 로그인 연동 현황
}

// 제품 타입 정의
export interface Product {
  id: number;
  name: string;
  brand: string;
  series: string;
  company: string;
  distillery: string;
  maltType: string;
  caskType: string;
  caskNumber: string;
  abv: number;
  capacity: number;
  distillationDate: string;
  bottledDate: string;
  agingYears: number;
  totalQuantity: number;
  description: string;
  imgUrl: string;
  price: number;
  stock: number;
  status: string;
  extraInfos: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// 예약 신청자 타입
export interface Applicant {
  id: number;
  userId: number;
  bottleId: number;
  bottleName: string;
  noticeId: number;
  quantity: number;
  confirmedQuantity: number;
  status: "CONFIRMED" | "APPLIED" | "REJECTED";
  pickupUserBusinessId: number;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  memberType: "일반" | "업장";
  whiskeyNaviMembership: "VIP" | "GOLD" | "SILVER" | null;
  whiskeyTalesMembership: "VIP" | "GOLD" | "SILVER" | null;
  pickupLocation: string;
  requestedBottles?: number;
  approvedBottles?: number;
  appliedAt?: string;
}

// 예약 타입
export interface Reservation {
  id: number;
  bottleId: string;
  productName: string;
  brand: string;
  totalQuantity: number;
  currentReservations: number;
  price: number;
  status: string;
  noticeDate: string;
  deadline: string;
  imageUrl: string;
  applicants: Applicant[];
  username: string;
  reservationDate: string;
  quantity: number;
}

// 블랙리스트 타입
export interface BlacklistItem {
  id: number;
  name: string;
  reason: string;
  startAt: string;
  endAt: string;
}

// 멤버십 혜택 타입
export interface MembershipBenefit {
  discount: number;
  earlyAccess: number;
  freeShipping: boolean;
  exclusiveProducts: boolean;
  prioritySupport: boolean;
}

export interface MembershipBenefits {
  navi: {
    VIP: MembershipBenefit;
    GOLD: MembershipBenefit;
    SILVER: MembershipBenefit;
  };
  tales: {
    VIP: MembershipBenefit;
    GOLD: MembershipBenefit;
    SILVER: MembershipBenefit;
  };
}

// 예약자 더미 데이터
export const extendedApplicants: Applicant[] = [
  {
    id: 1,
    userId: 1,
    bottleId: 1,
    bottleName: "Glenfiddich 1993 Whisky Navi Single Cask",
    noticeId: 1,
    quantity: 2,
    confirmedQuantity: 2,
    status: "CONFIRMED",
    pickupUserBusinessId: 1,
    createdAt: "2026-01-10T14:23:00.000Z",
    updatedAt: "2026-01-11T10:00:00.000Z",
    name: "홍길동",
    email: "whisky.lover@example.com",
    phone: "010-1234-5678",
    memberType: "일반",
    whiskeyNaviMembership: "VIP",
    whiskeyTalesMembership: "GOLD",
    pickupLocation: "강남점",
    requestedBottles: 2,
    approvedBottles: 2,
    appliedAt: "2026-01-10T14:23:00.000Z",
  },
  {
    id: 2,
    userId: 2,
    bottleId: 1,
    bottleName: "Glenfiddich 1993 Whisky Navi Single Cask",
    noticeId: 1,
    quantity: 5,
    confirmedQuantity: 3,
    status: "CONFIRMED",
    pickupUserBusinessId: 2,
    createdAt: "2026-01-10T15:45:00.000Z",
    updatedAt: "2026-01-11T10:00:00.000Z",
    name: "김영희",
    email: "scotch.master.premium@example.com",
    phone: "010-2345-6789",
    memberType: "업장",
    whiskeyNaviMembership: "GOLD",
    whiskeyTalesMembership: null,
    pickupLocation: "홍대점",
    requestedBottles: 5,
    approvedBottles: 3,
    appliedAt: "2026-01-10T15:45:00.000Z",
  },
  {
    id: 3,
    userId: 3,
    bottleId: 1,
    bottleName: "Glenfiddich 1993 Whisky Navi Single Cask",
    noticeId: 1,
    quantity: 3,
    confirmedQuantity: 3,
    status: "CONFIRMED",
    pickupUserBusinessId: 3,
    createdAt: "2026-01-11T09:12:00.000Z",
    updatedAt: "2026-01-11T10:00:00.000Z",
    name: "이철수",
    email: "whisky.fan.collection@example.com",
    phone: "010-3456-7890",
    memberType: "일반",
    whiskeyNaviMembership: "SILVER",
    whiskeyTalesMembership: "SILVER",
    pickupLocation: "부산점",
    requestedBottles: 3,
    approvedBottles: 3,
    appliedAt: "2026-01-11T09:12:00.000Z",
  },
];

// 회원 데이터 생성
export function generateUsers(): User[] {
  const baseUsers: User[] = [
    {
      id: 1,
      username: "whisky_lover",
      name: "홍길동",
      email: "whisky.lover@example.com",
      phone: "010-1234-5678",
      whiskeyNaviMembership: "VIP",
      whiskeyTalesMembership: "GOLD",
      status: "ACTIVE",
      roles: ["ROLE_USER", "ROLE_NAVI_VIP", "ROLE_TALES_GOLD"],
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2026-01-20T15:30:00Z",
      lastLoginAt: "2026-01-21T09:45:00Z",
      userExt: {
        privacyAgree: true,
        marketingAgree: true,
        emailAgree: true,
        smsAgree: false,
        isBanned: false,
        banReason: null,
        banStartAt: null,
        banEndAt: null,
      },
      totalOrders: 15,
      totalSpent: 4500000,
      socialConnections: { google: true, kakao: true, naver: false },
    },
    {
      id: 2,
      username: "scotch_master",
      name: "김영희",
      email: "scotch@example.com",
      phone: "010-2345-6789",
      whiskeyNaviMembership: "GOLD",
      whiskeyTalesMembership: null,
      status: "ACTIVE",
      roles: ["ROLE_USER", "ROLE_BUSINESS", "ROLE_NAVI_GOLD"],
      createdAt: "2025-02-01T09:00:00Z",
      updatedAt: "2026-01-19T11:20:00Z",
      lastLoginAt: "2026-01-20T14:30:00Z",
      userExt: {
        privacyAgree: true,
        marketingAgree: false,
        emailAgree: false,
        smsAgree: true,
        isBanned: false,
        banReason: null,
        banStartAt: null,
        banEndAt: null,
      },
      totalOrders: 8,
      totalSpent: 2800000,
      socialConnections: { google: false, kakao: true, naver: true },
    },
    {
      id: 3,
      username: "admin_user",
      name: "관리자",
      email: "admin@whiskynavi.com",
      phone: "010-9999-0000",
      whiskeyNaviMembership: "VIP",
      whiskeyTalesMembership: "VIP",
      status: "ACTIVE",
      roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_NAVI_VIP", "ROLE_TALES_VIP"],
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2026-01-22T08:00:00Z",
      lastLoginAt: "2026-01-22T10:15:00Z",
      userExt: {
        privacyAgree: true,
        marketingAgree: true,
        emailAgree: true,
        smsAgree: true,
        isBanned: false,
        banReason: null,
        banStartAt: null,
        banEndAt: null,
      },
      totalOrders: 25,
      totalSpent: 12500000,
      socialConnections: { google: true, kakao: true, naver: true },
    },
  ];

  const additionalUsers: User[] = [];
  const memberships: ("VIP" | "GOLD" | "SILVER" | null)[] = [
    "VIP",
    "GOLD",
    "SILVER",
    null,
  ];

  for (let i = 4; i <= 50; i++) {
    const naviMembership = memberships[i % 4];
    const talesMembership = memberships[(i + 1) % 4];
    const naviRole = naviMembership ? `ROLE_NAVI_${naviMembership}` : null;
    const talesRole = talesMembership ? `ROLE_TALES_${talesMembership}` : null;
    const roles = ["ROLE_USER"];
    if (i % 2 === 1) roles.push("ROLE_BUSINESS"); // 홀수 ID는 업장 회원
    if (naviRole) roles.push(naviRole);
    if (talesRole) roles.push(talesRole);

    const day = String((i % 28) + 1).padStart(2, "0");
    const loginDay = String(Math.min((i % 28) + 1, 22)).padStart(2, "0");

    additionalUsers.push({
      id: i,
      username: `user_${i}`,
      name: `회원${i}`,
      email: `user${i}@example.com`,
      phone: `010-${String(1000 + i).slice(-4)}-${String(5678 + i).slice(-4)}`,
      whiskeyNaviMembership: naviMembership,
      whiskeyTalesMembership: talesMembership,
      status: i % 10 === 0 ? "INACTIVE" : "ACTIVE",
      roles,
      createdAt: `2025-01-${day}T10:00:00Z`,
      updatedAt: `2026-01-${loginDay}T12:00:00Z`,
      lastLoginAt: `2026-01-${loginDay}T14:30:00Z`,
      userExt: {
        privacyAgree: true,
        marketingAgree: i % 3 !== 0,
        emailAgree: i % 2 === 0,
        smsAgree: i % 3 === 0,
        isBanned: i % 15 === 0,
        banReason: i % 15 === 0 ? "부적절한 행위로 인한 정지" : null,
        banStartAt: i % 15 === 0 ? "2026-01-15T00:00:00Z" : null,
        banEndAt: i % 15 === 0 ? "2026-02-15T00:00:00Z" : null,
      },
      totalOrders: i % 20,
      totalSpent: (i % 20) * 350000,
      socialConnections: {
        google: i % 3 === 0,
        kakao: i % 2 === 0,
        naver: i % 4 === 0,
      },
    });
  }

  return [...baseUsers, ...additionalUsers];
}

// 제품 데이터 생성
export function generateProducts(): Product[] {
  const baseProducts: Product[] = [
    {
      id: 1,
      name: "Glenfiddich 1993",
      brand: "위스키내비",
      series: "Single Cask Collection",
      company: "Whisky Navi Korea",
      distillery: "Glenfiddich",
      maltType: "Single Malt",
      caskType: "Sherry Butt",
      caskNumber: "1234",
      abv: 52.3,
      capacity: 700,
      distillationDate: "1993-05-15",
      bottledDate: "2023-11-20",
      agingYears: 30,
      totalQuantity: 240,
      description:
        "셰리 버트에서 숙성된 글렌피딕 1993년산 싱글 캐스크 위스키입니다.",
      imgUrl:
        "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400",
      price: 350000,
      stock: 12,
      status: "판매중",
      extraInfos: {},
      createdAt: "2025-01-15T10:00:00Z",
      updatedAt: "2025-01-20T15:30:00Z",
    },
    {
      id: 2,
      name: "Lagavulin 2005",
      brand: "더 위스키테일즈",
      series: "Islay Collection",
      company: "Whisky Navi Korea",
      distillery: "Lagavulin",
      maltType: "Single Malt",
      caskType: "Ex-Bourbon",
      caskNumber: "5678",
      abv: 58.7,
      capacity: 700,
      distillationDate: "2005-03-10",
      bottledDate: "2024-01-15",
      agingYears: 19,
      totalQuantity: 180,
      description: "아일라 위스키의 정수를 담은 라가불린 2005년산입니다.",
      imgUrl:
        "https://images.unsplash.com/photo-1527281400466-a3562d75a501?w=400",
      price: 420000,
      stock: 8,
      status: "판매중",
      extraInfos: {},
      createdAt: "2025-02-01T09:00:00Z",
      updatedAt: "2025-02-05T11:20:00Z",
    },
    {
      id: 3,
      name: "Ardbeg 2008",
      brand: "위스키내비",
      series: "Peated Edition",
      company: "Whisky Navi Korea",
      distillery: "Ardbeg",
      maltType: "Single Malt",
      caskType: "Port Pipe",
      caskNumber: "9101",
      abv: 54.2,
      capacity: 700,
      distillationDate: "2008-09-20",
      bottledDate: "2023-12-10",
      agingYears: 15,
      totalQuantity: 150,
      description: "포트 파이프에서 숙성된 강렬한 피트향의 아드벡입니다.",
      imgUrl:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400",
      price: 380000,
      stock: 0,
      status: "품절",
      extraInfos: {},
      createdAt: "2024-12-20T14:00:00Z",
      updatedAt: "2025-01-18T16:45:00Z",
    },
  ];

  const additionalProducts: Product[] = [];
  const distilleries = [
    "Macallan",
    "Glenlivet",
    "Highland Park",
    "Springbank",
    "Bowmore",
  ];
  const brands = [
    "위스키내비",
    "더 위스키테일즈",
    "트레일 앤 테일",
    "투게더 인 스피릿",
  ];

  for (let i = 4; i <= 50; i++) {
    additionalProducts.push({
      id: i,
      name: `${distilleries[i % 5]} ${2000 + (i % 20)}`,
      brand: brands[i % 4],
      series: "Limited Edition",
      company: "Whisky Navi Korea",
      distillery: distilleries[i % 5],
      maltType: "Single Malt",
      caskType: "Sherry Butt",
      caskNumber: `${1000 + i}`,
      abv: 50 + (i % 10),
      capacity: 700,
      distillationDate: `${2000 + (i % 20)}-01-01`,
      bottledDate: "2024-01-01",
      agingYears: 15 + (i % 10),
      totalQuantity: 200,
      description: `프리미엄 위스키 ${i}번`,
      imgUrl:
        "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400",
      price: 300000 + i * 10000,
      stock: i % 5,
      status: i % 5 === 0 ? "품절" : "판매중",
      extraInfos: {},
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-20T00:00:00Z",
    });
  }

  return [...baseProducts, ...additionalProducts];
}

// 예약 데이터 생성
export function generateReservations(): Reservation[] {
  const baseReservations: Reservation[] = [
    {
      id: 1,
      bottleId: "BT-2026-001",
      productName: "Glenfiddich 1993 Whisky Navi Single Cask",
      brand: "위스키내비",
      totalQuantity: 240,
      currentReservations: 187,
      price: 350000,
      status: "예약진행중",
      noticeDate: "2026.01.10",
      deadline: "2026.01.31",
      imageUrl:
        "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400",
      applicants: extendedApplicants,
      username: "whisky_lover",
      reservationDate: "2026.01.10",
      quantity: 2,
    },
    {
      id: 2,
      bottleId: "BT-2026-002",
      productName: "Lagavulin 2005 The Whisky Tales Edition",
      brand: "더 위스키테일즈",
      totalQuantity: 180,
      currentReservations: 180,
      price: 420000,
      status: "통관중",
      noticeDate: "2026.01.05",
      deadline: "2026.01.25",
      imageUrl:
        "https://images.unsplash.com/photo-1527281400934-a78fc40cae85?w=400",
      applicants: [],
      username: "scotch_master",
      reservationDate: "2026.01.05",
      quantity: 5,
    },
    {
      id: 3,
      bottleId: "BT-2025-012",
      productName: "Ardbeg 2008 Trail & Tale Peated",
      brand: "트레일 앤 테일",
      totalQuantity: 200,
      currentReservations: 200,
      price: 380000,
      status: "배송완료",
      noticeDate: "2025.12.18",
      deadline: "2025.12.30",
      imageUrl:
        "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400",
      applicants: [],
      username: "admin_user",
      reservationDate: "2025.12.18",
      quantity: 3,
    },
  ];

  const additionalReservations: Reservation[] = [];
  const statuses = ["예약진행중", "예약마감", "통관중", "배송중", "배송완료"];
  const brands = [
    "위스키내비",
    "더 위스키테일즈",
    "트레일 앤 테일",
    "투게더 인 스피릿",
  ];

  for (let i = 4; i <= 50; i++) {
    additionalReservations.push({
      id: i,
      bottleId: `BT-2026-${String(i).padStart(3, "0")}`,
      productName: `위스키 제품 ${i}`,
      brand: brands[i % 4],
      totalQuantity: 200,
      currentReservations: Math.floor(Math.random() * 200),
      price: 300000 + i * 5000,
      status: statuses[i % 5],
      noticeDate: `2026.01.${String((i % 28) + 1).padStart(2, "0")}`,
      deadline: `2026.02.${String((i % 28) + 1).padStart(2, "0")}`,
      imageUrl:
        "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400",
      applicants: [],
      username: `user_${i}`,
      reservationDate: `2026.01.${String((i % 28) + 1).padStart(2, "0")}`,
      quantity: Math.floor(Math.random() * 200),
    });
  }

  return [...baseReservations, ...additionalReservations];
}

// 블랙리스트 데이터
export const initialBlacklist: BlacklistItem[] = [
  {
    id: 1,
    name: "홍길동",
    reason:
      "중복 예약으로 인한 다른 회원 피해 발생. 3회 이상 반복된 행위로 예약 제한 조치.",
    startAt: "2026.01.01",
    endAt: "2026.06.30",
  },
  {
    id: 2,
    name: "김철수",
    reason: "부적절한 언행 및 고객센터 직원에 대한 폭언. 회사 정책 위반 심각.",
    startAt: "2026.01.10",
    endAt: "영구",
  },
  {
    id: 3,
    name: "박영희",
    reason: "고액 주문 후 잦은 반품 이력 있음. 모니터링 필요.",
    startAt: "-",
    endAt: "-",
  },
];

// 멤버십 혜택 데이터
export const initialMembershipBenefits: MembershipBenefits = {
  navi: {
    VIP: {
      discount: 15,
      earlyAccess: 3,
      freeShipping: true,
      exclusiveProducts: true,
      prioritySupport: true,
    },
    GOLD: {
      discount: 10,
      earlyAccess: 2,
      freeShipping: true,
      exclusiveProducts: false,
      prioritySupport: false,
    },
    SILVER: {
      discount: 5,
      earlyAccess: 1,
      freeShipping: false,
      exclusiveProducts: false,
      prioritySupport: false,
    },
  },
  tales: {
    VIP: {
      discount: 15,
      earlyAccess: 3,
      freeShipping: true,
      exclusiveProducts: true,
      prioritySupport: true,
    },
    GOLD: {
      discount: 10,
      earlyAccess: 2,
      freeShipping: true,
      exclusiveProducts: false,
      prioritySupport: false,
    },
    SILVER: {
      discount: 5,
      earlyAccess: 1,
      freeShipping: false,
      exclusiveProducts: false,
      prioritySupport: false,
    },
  },
};
