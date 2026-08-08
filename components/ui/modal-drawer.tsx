"use client";

import * as React from "react";
import { useResponsive } from "@/lib/hooks/use-responsive";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface ReusableModalProps {
  title?: string;
  trigger?: React.ReactNode;
  footer?: React.ReactNode;
  children: (onClose: () => void) => React.ReactNode;
  onClose?: () => void;
  className?: string;
  onlyDrawer?: boolean;
}

export type ReusableModalRef = {
  open: () => void;
  close: () => void;
};

const ModalDrawer = React.forwardRef<ReusableModalRef, ReusableModalProps>(
  (
    {
      title,
      trigger,
      footer,
      children,
      onClose,
      className,
      onlyDrawer = false,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const isMobile = useResponsive("md");

    React.useImperativeHandle(ref, () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
    }));

    const handleClose = () => {
      setOpen(false);
      onClose?.();
    };

    const handleOpenChange = (isOpen: boolean) => {
      setOpen(isOpen);
      if (!isOpen) {
        onClose?.();
      }
    };

    if (isMobile || onlyDrawer) {
      return (
        <Drawer open={open} onOpenChange={handleOpenChange} modal>
          {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}
          <DrawerContent className={cn("mx-auto", className)}>
            <DrawerHeader className="px-4 md:px-6">
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {children(handleClose)}
            </div>
            {footer && <DrawerFooter>{footer}</DrawerFooter>}
          </DrawerContent>
        </Drawer>
      );
    }

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}
        <DialogContent
          className={cn("max-h-[85vh] overflow-y-auto rounded-3xl", className)}
        >
          <DialogHeader className="px-4 md:px-6">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children(handleClose)}
        </DialogContent>
      </Dialog>
    );
  }
);

ModalDrawer.displayName = "ModalDrawer";
export default ModalDrawer;
