import { FunctionComponent, JSX } from "react";
import { NotificationProps } from "../types/modals.types";

const Notification: FunctionComponent<NotificationProps> = ({
  notification,
  setNotification,
}): JSX.Element => {
  return (
    <div
      className="inset-0 justify-center fixed z-50 bg-opacity-50 backdrop-blur-sm overflow-y-hidden grid grid-flow-col auto-cols-auto w-full h-auto cursor-pixel items-center justify-center"
      onClick={() => setNotification(undefined)}
    >
      <div
        className="pixel-border-2 rounded-2xl w-96 h-fit text-sm text-black flex items-center justify-start p-3 cursor-default flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-1/2 py-3 h-fit flex items-center justify-center text-center font-jack">
          {notification}
        </div>
      </div>
    </div>
  );
};

export default Notification;
