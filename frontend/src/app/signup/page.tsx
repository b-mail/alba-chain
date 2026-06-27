import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>회원가입</CardTitle>
          <CardDescription>매장을 등록하고 팀을 초대하세요</CardDescription>
        </CardHeader>
        <form className="space-y-4">
          <div>
            <Label htmlFor="store">매장명</Label>
            <Input id="store" placeholder="강남 2호점" />
          </div>
          <div>
            <Label htmlFor="name">이름</Label>
            <Input id="name" placeholder="홍길동" />
          </div>
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="you@store.com" />
          </div>
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" placeholder="8자 이상" />
          </div>
          <div>
            <Label>역할</Label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-brand-500 bg-brand-50 py-3 text-sm font-semibold text-brand-700">
                <input type="radio" name="role" className="sr-only" defaultChecked />
                사장님
              </label>
              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-border py-3 text-sm font-medium text-muted">
                <input type="radio" name="role" className="sr-only" />
                알바생
              </label>
            </div>
          </div>
          <Button type="submit" className="w-full">
            무료로 시작하기
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-semibold text-brand-600">
            로그인
          </Link>
        </p>
      </Card>
    </div>
  );
}
