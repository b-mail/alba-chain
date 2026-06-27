import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>로그인</CardTitle>
          <CardDescription>올바 Alba 계정으로 접속하세요</CardDescription>
        </CardHeader>
        <form className="space-y-4">
          <div>
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" placeholder="you@store.com" />
          </div>
          <div>
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full">
            로그인
          </Button>
        </form>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/owner/dashboard">
            <Button variant="secondary" className="w-full" size="sm">
              사장님 데모
            </Button>
          </Link>
          <Link href="/worker/dashboard">
            <Button variant="secondary" className="w-full" size="sm">
              알바생 데모
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-center text-sm text-muted">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-semibold text-brand-600">
            회원가입
          </Link>
        </p>
      </Card>
    </div>
  );
}
