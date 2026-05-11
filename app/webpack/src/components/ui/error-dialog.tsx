"use client";

import * as React from "react";
import { AlertTriangleIcon } from "lucide-react";

// เรียกใช้ Base Component จากโฟลเดอร์ ui ของคุณ
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./dialog";
import { Button } from "./button";

// กำหนด Props สำหรับรับค่าต่างๆ เพื่อให้ปรับเปลี่ยนข้อความได้ตามต้องการ
interface ErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: React.ReactNode;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorDialog({
  open,
  onOpenChange,
  title = "เกิดข้อผิดพลาด",
  description = "ไม่สามารถดำเนินการต่อได้ เนื่องจากเกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง",
  onRetry,
  retryText = "ลองใหม่อีกครั้ง",
}: ErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        
        <DialogHeader className="flex flex-col items-center gap-4 text-center sm:text-center mt-2">
          {/* ไอคอนแสดงความผิดพลาด */}
          <div className="p-3 rounded-full bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center">
            <AlertTriangleIcon className="w-8 h-8" strokeWidth={1.5} />
          </div>
          
          {/* ข้อความ Error */}
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-xl text-destructive font-semibold">
              {title}
            </DialogTitle>
            <DialogDescription className="text-base text-balance text-muted-foreground/80">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        {/* ปุ่มกด */}
        <DialogFooter className="sm:justify-center gap-2 mt-6 flex-col sm:flex-row w-full">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto min-w-[120px]">
              ปิด
            </Button>
          </DialogClose>
          
          {onRetry && (
            <Button
              variant="destructive"
              className="w-full sm:w-auto min-w-[120px]"
              onClick={() => {
                onRetry();
                onOpenChange(false);
              }}
            >
              {retryText}
            </Button>
          )}
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}