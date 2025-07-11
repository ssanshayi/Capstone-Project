export const metadata = {
    title: "Welcome - Marine Eyes",
    description: "Landing animation screen",
  }
  
  export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    )
  }