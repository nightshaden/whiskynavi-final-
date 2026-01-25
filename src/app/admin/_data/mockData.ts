// 회원 타입 정의
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  memberType: "일반" | "업장";
  whiskeyNaviMembership: "VIP" | "GOLD" | "SILVER" | null;
  whiskeyTalesMembership: "VIP" | "GOLD" | "SILVER" | null;
  status: "ACTIVE" | "INACTIVE";
  joinDate: string;
  lastLoginAt: string;
  totalOrders: number;
  totalSpent: number;
  roles: string[];
  socialConnections: {
    google: boolean;
    kakao: boolean;
    naver: boolean;
  };
  userExt: {
    privacyAgree: boolean;
    marketingAgree: boolean;
    emailAgree: boolean;
    smsAgree: boolean;
    isBanned: boolean;
    banReason: string | null;
    banStartDate: string | null;
    banEndDate: string | null;
  };
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
}

// 블랙리스트 타입
export interface BlacklistItem {
  id: number;
  name: string;
  email: string;
  reason: string;
  restrictionType: "요주의 인물" | "예약 제한" | "전체 서비스 제한";
  startDate: string;
  endDate: string;
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
      memberType: "일반",
      whiskeyNaviMembership: "VIP",
      whiskeyTalesMembership: "GOLD",
      status: "ACTIVE",
      joinDate: "2025.01.15",
      lastLoginAt: "2026.01.21",
      totalOrders: 5,
      totalSpent: 1850000,
      roles: ["ROLE_USER", "ROLE_NAVI_VIP", "ROLE_TALES_GOLD"],
      socialConnections: { google: true, kakao: false, naver: false },
      userExt: {
        privacyAgree: true,
        marketingAgree: true,
        emailAgree: true,
        smsAgree: false,
        isBanned: false,
        banReason: null,
        banStartDate: null,
        banEndDate: null,
      },
    },
    {
      id: 2,
      username: "scotch_master",
      name: "김영희",
      email: "scotch@example.com",
      phone: "010-2345-6789",
      memberType: "업장",
      whiskeyNaviMembership: "GOLD",
      whiskeyTalesMembership: null,
      status: "ACTIVE",
      joinDate: "2025.02.01",
      lastLoginAt: "2026.01.20",
      totalOrders: 12,
      totalSpent: 4200000,
      roles: ["ROLE_USER", "ROLE_NAVI_GOLD"],
      socialConnections: { google: false, kakao: true, naver: false },
      userExt: {
        privacyAgree: true,
        marketingAgree: false,
        emailAgree: false,
        smsAgree: true,
        isBanned: false,
        banReason: null,
        banStartDate: null,
        banEndDate: null,
      },
    },
    {
      id: 3,
      username: "admin_user",
      name: "관리자",
      email: "admin@whiskynavi.com",
      phone: "010-9999-0000",
      memberType: "일반",
      whiskeyNaviMembership: "VIP",
      whiskeyTalesMembership: "VIP",
      status: "ACTIVE",
      joinDate: "2024.01.01",
      lastLoginAt: "2026.01.22",
      totalOrders: 0,
      totalSpent: 0,
      roles: ["ROLE_ADMIN", "ROLE_USER", "ROLE_NAVI_VIP", "ROLE_TALES_VIP"],
      socialConnections: { google: true, kakao: true, naver: true },
      userExt: {
        privacyAgree: true,
        marketingAgree: true,
        emailAgree: true,
        smsAgree: true,
        isBanned: false,
        banReason: null,
        banStartDate: null,
        banEndDate: null,
      },
    },
  ];

  const additionalUsers: User[] = [];
  const memberTypes: ("일반" | "업장")[] = ["일반", "업장"];
  const memberships: ("VIP" | "GOLD" | "SILVER" | null)[] = [
    "VIP",
    "GOLD",
    "SILVER",
    null,
  ];
  const socialProviders = [
    { google: true, kakao: false, naver: false },
    { google: false, kakao: true, naver: false },
    { google: false, kakao: false, naver: true },
    { google: true, kakao: true, naver: false },
    { google: false, kakao: false, naver: false },
  ];

  for (let i = 4; i <= 50; i++) {
    const naviMembership = memberships[i % 4];
    const talesMembership = memberships[(i + 1) % 4];
    const naviRole = naviMembership ? `ROLE_NAVI_${naviMembership}` : null;
    const talesRole = talesMembership ? `ROLE_TALES_${talesMembership}` : null;
    const roles = ["ROLE_USER"];
    if (naviRole) roles.push(naviRole);
    if (talesRole) roles.push(talesRole);

    additionalUsers.push({
      id: i,
      username: `user_${i}`,
      name: `회원${i}`,
      email: `user${i}@example.com`,
      phone: `010-${String(1000 + i).slice(-4)}-${String(5678 + i).slice(-4)}`,
      memberType: memberTypes[i % 2],
      whiskeyNaviMembership: naviMembership,
      whiskeyTalesMembership: talesMembership,
      status: i % 10 === 0 ? "INACTIVE" : "ACTIVE",
      joinDate: `2025.01.${String((i % 28) + 1).padStart(2, "0")}`,
      lastLoginAt: `2026.01.${String(Math.min((i % 28) + 1, 22)).padStart(2, "0")}`,
      totalOrders: Math.floor(Math.random() * 20),
      totalSpent: Math.floor(Math.random() * 5000000),
      roles,
      socialConnections: socialProviders[i % 5],
      userExt: {
        privacyAgree: true,
        marketingAgree: i % 3 !== 0,
        emailAgree: i % 2 === 0,
        smsAgree: i % 3 === 0,
        isBanned: i % 15 === 0,
        banReason: i % 15 === 0 ? "부적절한 행위로 인한 정지" : null,
        banStartDate: i % 15 === 0 ? "2026.01.15" : null,
        banEndDate: i % 15 === 0 ? "2026.02.15" : null,
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
    });
  }

  return [...baseReservations, ...additionalReservations];
}

// 블랙리스트 데이터
export const initialBlacklist: BlacklistItem[] = [
  {
    id: 1,
    name: "홍길동",
    email: "hong@example.com",
    reason:
      "중복 예약으로 인한 다른 회원 피해 발생. 3회 이상 반복된 행위로 예약 제한 조치.",
    restrictionType: "예약 제한",
    startDate: "2026.01.01",
    endDate: "2026.06.30",
  },
  {
    id: 2,
    name: "김철수",
    email: "kim@example.com",
    reason: "부적절한 언행 및 고객센터 직원에 대한 폭언. 회사 정책 위반 심각.",
    restrictionType: "전체 서비스 제한",
    startDate: "2026.01.10",
    endDate: "영구",
  },
  {
    id: 3,
    name: "박영희",
    email: "park@example.com",
    reason: "고액 주문 후 잦은 반품 이력 있음. 모니터링 필요.",
    restrictionType: "요주의 인물",
    startDate: "-",
    endDate: "-",
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

// 통계 데이터
export const stats = {
  totalUsers: 1250,
  totalOrders: 3456,
  totalRevenue: 890000000,
  monthlyRevenue: 125000000,
  activeProducts: 45,
  lowStock: 8,
};
