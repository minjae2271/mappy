export default function RegionLayout({
    children,
    modal,
  }: {
    children: React.ReactNode;
    modal: React.ReactNode;
  }) {
    return (
      <div>
        {children}
        {modal}
      </div>
    );
  }
  