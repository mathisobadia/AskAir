const Gradient = ({ children }: { children: React.ReactNode }) => {
  return (
    // <span className="font-bold bg-clip-text text-transparent bg-[linear-gradient(to_right,theme(colors.indigo.400),theme(colors.indigo.100),theme(colors.sky.400),theme(colors.fuchsia.400),theme(colors.sky.400),theme(colors.indigo.100),theme(colors.indigo.400))] bg-[length:200%_auto] animate-gradient">
    //   {children}
    // </span>

    <span className="font-bold ">{children}</span>
  );
};

export default Gradient;
