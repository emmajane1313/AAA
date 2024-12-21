import { useState } from "react";

const useHeader = () => {
    const [openAccount, setOpenAccount] = useState<boolean>(false);



    return {
        openAccount, setOpenAccount
    }
};

export default useHeader;
