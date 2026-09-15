export type QrBankItem = {
  id: string;
  bank: string;
  accountName: string;
  accountNumber: string;
  imageSrc: string;
};

export const QR_BANK_ITEMS: QrBankItem[] = [
  {
    id: "tpbank-1",
    bank: "TPBank",
    accountName: "DUONG VAN TIN",
    accountNumber: "0086 2900 001",
    imageSrc: "/images/qr-bank/tpbank-1.jpeg",
  },
  {
    id: "tpbank-2",
    bank: "TPBank 2",
    accountName: "DUONG VAN TIN",
    accountNumber: "1841 9248 888",
    imageSrc: "/images/qr-bank/tpbank-2.jpeg",
  },
  {
    id: "techcombank",
    bank: "Techcombank",
    accountName: "DUONG VAN TIN",
    accountNumber: "1903 3332 3350 10",
    imageSrc: "/images/qr-bank/Techcombank.jpeg",
  },
  {
    id: "mb-bank",
    bank: "MB Bank",
    accountName: "DUONG VAN TIN",
    accountNumber: "962646789",
    imageSrc: "/images/qr-bank/MB-bank.png",
  },
  {
    id: "timo",
    bank: "Timo",
    accountName: "DUONG VAN TIN",
    accountNumber: "0983648016",
    imageSrc: "/images/qr-bank/timo-bank.jpeg",
  },
];
