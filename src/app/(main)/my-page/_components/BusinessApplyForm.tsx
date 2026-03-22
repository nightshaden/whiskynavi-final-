import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { FC } from "react";

interface Props {}

const BusinessRegisterForm: FC<Props> = () => {
  return (
    <form onSubmit={handleBusinessSubmit} className="space-y-4 md:space-y-6">
      <div>
        <Label
          htmlFor="businessName"
          className="typo-bold-14 mb-2 block text-gray-900"
        >
          사업자 이름 *
        </Label>
        <Input
          id="businessName"
          type="text"
          required
          value={businessFormData.businessName}
          onChange={(e) =>
            setBusinessFormData({
              ...businessFormData,
              businessName: e.target.value,
            })
          }
          placeholder="사업자명을 입력하세요"
          className="w-full"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="pickupStore"
          checked={isPickupStore}
          onCheckedChange={(checked) => setIsPickupStore(checked as boolean)}
        />
        <Label
          htmlFor="pickupStore"
          className="typo-medium-14 cursor-pointer text-gray-900"
        >
          픽업매장 등록
        </Label>
      </div>

      {isPickupStore && (
        <div>
          <Label
            htmlFor="pickupAddress"
            className="typo-bold-14 mb-2 block text-gray-900"
          >
            픽업매장 주소 *
          </Label>
          <Input
            id="pickupAddress"
            type="text"
            required
            value={businessFormData.pickupAddress}
            onChange={(e) =>
              setBusinessFormData({
                ...businessFormData,
                pickupAddress: e.target.value,
              })
            }
            placeholder="픽업매장 주소를 입력하세요"
            className="w-full"
          />
        </div>
      )}

      <div>
        <Label
          htmlFor="contact"
          className="typo-bold-14 mb-2 block text-gray-900"
        >
          연락처 *
        </Label>
        <Input
          id="contact"
          type="text"
          required
          value={businessFormData.contact}
          onChange={(e) =>
            setBusinessFormData({
              ...businessFormData,
              contact: e.target.value,
            })
          }
          placeholder="이메일 또는 전화번호를 입력하세요"
          className="w-full"
        />
      </div>

      <div>
        <Label
          htmlFor="businessRegistrationNumber"
          className="typo-bold-14 mb-2 block text-gray-900"
        >
          사업자 등록번호 *
        </Label>
        <Input
          id="businessRegistrationNumber"
          type="text"
          required
          value={businessFormData.businessRegistrationNumber}
          onChange={(e) =>
            setBusinessFormData({
              ...businessFormData,
              businessRegistrationNumber: e.target.value,
            })
          }
          placeholder="사업자 등록번호를 입력하세요 (예: 123-45-67890)"
          className="w-full"
        />
      </div>

      <div>
        <Label
          htmlFor="document"
          className="typo-bold-14 mb-2 block text-gray-900"
        >
          사업자 등록증 *
        </Label>
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400">
          <input
            id="document"
            type="file"
            required
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setBusinessFormData({ ...businessFormData, document: file });
            }}
            className="hidden"
          />
          <label htmlFor="document" className="block cursor-pointer">
            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
            {businessFormData.document ? (
              <div className="space-y-1">
                <p className="typo-medium-14 text-gray-900">
                  {businessFormData.document.name}
                </p>
                <p className="text-xs text-gray-500">
                  파일을 다시 선택하려면 클릭하세요
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="typo-medium-14 text-gray-900">
                  파일을 선택하세요
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG (최대 10MB)
                </p>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-gray-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
        >
          등록 신청
        </button>
        <button
          type="button"
          onClick={() => setShowBusinessRegister(false)}
          className="border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          취소
        </button>
      </div>
    </form>
  );
};

export default BusinessRegisterForm;
