"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type ReviewQrCodeProps = {
  value: string;
};

export default function ReviewQrCode({ value }: ReviewQrCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    async function generateQrCode() {
      const dataUrl = await QRCode.toDataURL(value, {
        width: 360,
        margin: 2,
      });

      setQrCodeUrl(dataUrl);
    }

    generateQrCode();
  }, [value]);

  if (!qrCodeUrl) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-border bg-background text-sm font-semibold text-muted-foreground">
        Generating QR code...
      </div>
    );
  }

  return (
    <img
      src={qrCodeUrl}
      alt="Review QR code"
      className="aspect-square w-full rounded-2xl border border-border bg-white p-4"
    />
  );
}