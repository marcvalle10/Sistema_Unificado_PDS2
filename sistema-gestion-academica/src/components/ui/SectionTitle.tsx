"use client";

interface SectionTitleProps {
  title: string;
}

export default function SectionTitle({ title }: SectionTitleProps) {
  return (
    <h3
      className="
        text-xl     /* 🔹 20 px aprox. */
        font-sans 
        font-semibold 
        mb-3 
        text-[#16469B]
      "
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {title}
    </h3>
  );
}
