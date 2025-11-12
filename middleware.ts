// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // 未ログイン時にリダイレクトされるページ
  },
});

// ✅ 保護したいルートを指定
export const config = {
  matcher: ["/", "/train/:path*", "/reward/:path*"], // 認証が必要なページ
};
