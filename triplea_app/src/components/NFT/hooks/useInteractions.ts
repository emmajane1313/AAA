import { Post, SessionClient } from "@lens-protocol/client";
import { SetStateAction, useEffect, useState } from "react";
import createPost from "../../../../graphql/lens/mutations/createPost";
import { StorageClient } from "@lens-protocol/storage-node-client";
import { v4 as uuidv4 } from "uuid";
import createRepost from "../../../../graphql/lens/mutations/createRepost";
import addReaction from "../../../../graphql/lens/mutations/addReaction";

const useInteractions = (
  agentActivity: Post[] | undefined,
  sessionClient: SessionClient,
  setSignless: (e: SetStateAction<boolean>) => void,
  storageClient: StorageClient,
  nftId: string
) => {
  const [post, setPost] = useState<string>("");
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [commentQuote, setCommentQuote] = useState<
    | {
        type: "Comment" | "Quote";
        id: string;
      }
    | undefined
  >();
  const [interactionsLoading, setInteractionsLoading] = useState<
    {
      mirror: boolean;
      like: boolean;
      id: string;
    }[]
  >([]);

  const handlePost = async () => {
    if (post?.trim() == "") return;
    setPostLoading(true);
    try {
      const { uri } = await storageClient.uploadAsJson({
        $schema: "https://json-schemas.lens.dev/posts/text/3.0.0.json",
        lens: {
          mainContentFocus: focus,
          title: post?.slice(0, 10),
          content: post,
          id: uuidv4(),
          locale: "en",
          tags: ["tripleA", nftId],
        },
      });

      const res = await createPost(
        {
          contentUri: uri,
        },
        sessionClient!
      );

      if (
        (res as any)?.reason?.includes(
          "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
        )
      ) {
        setSignless?.(true);
      } else {
        setPost("");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setPostLoading(false);
  };

  const handleComment = async () => {
    if (!commentQuote) return;
    setPostLoading(true);
    try {
      const { uri } = await storageClient.uploadAsJson({
        $schema: "https://json-schemas.lens.dev/posts/text/3.0.0.json",
        lens: {
          mainContentFocus: focus,
          title: post?.slice(0, 10),
          content: post,
          id: uuidv4(),
          locale: "en",
          tags: ["tripleA", commentQuote],
        },
      });

      const res = await createPost(
        {
          contentUri: uri,
          commentOn: {
            post: commentQuote,
          },
        },
        sessionClient!
      );
      if (
        (res as any)?.reason?.includes(
          "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
        )
      ) {
        setSignless?.(true);
      } else {
        setPost("");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setPostLoading(false);
  };

  const handleLike = async (id: string, reaction: string) => {
    setInteractionsLoading((prev) => {
      let interactions = [...prev];

      let index = interactions?.findIndex((int) => int.id == id);
      interactions[index].like = true;

      return interactions;
    });
    try {
      const res = await addReaction(
        {
          post: id,
          reaction,
        },
        sessionClient!
      );

      if (
        (res as any)?.reason?.includes(
          "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
        )
      ) {
        setSignless?.(true);
      } else {
        setPost("");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setInteractionsLoading((prev) => {
      let interactions = [...prev];

      let index = interactions?.findIndex((int) => int.id == id);
      interactions[index].like = false;

      return interactions;
    });
  };

  const handleMirror = async (id: string) => {
    setInteractionsLoading((prev) => {
      let interactions = [...prev];

      let index = interactions?.findIndex((int) => int.id == id);
      interactions[index].mirror = true;

      return interactions;
    });
    try {
      const res = await createRepost(
        {
          post: id,
        },
        sessionClient!
      );

      if (
        (res as any)?.reason?.includes(
          "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
        )
      ) {
        setSignless?.(true);
      } else {
        setPost("");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setInteractionsLoading((prev) => {
      let interactions = [...prev];

      let index = interactions?.findIndex((int) => int.id == id);
      interactions[index].mirror = false;

      return interactions;
    });
  };

  const handleQuote = async () => {
    if (!commentQuote) return;
    setPostLoading(true);
    try {
      const { uri } = await storageClient.uploadAsJson({
        $schema: "https://json-schemas.lens.dev/posts/text/3.0.0.json",
        lens: {
          mainContentFocus: focus,
          title: post?.slice(0, 10),
          content: post,
          id: uuidv4(),
          locale: "en",
          tags: ["tripleA", commentQuote],
        },
      });

      const res = await createPost(
        {
          contentUri: uri,
          quoteOf: {
            post: commentQuote,
          },
        },
        sessionClient!
      );

      if (
        (res as any)?.reason?.includes(
          "Signless experience is unavailable for this operation. You can continue by signing the sponsored request."
        )
      ) {
        setSignless?.(true);
      } else {
        setPost("");
      }
    } catch (err: any) {
      console.error(err.message);
    }
    setPostLoading(false);
  };

  useEffect(() => {
    if (agentActivity && agentActivity?.length > 0) {
      setInteractionsLoading(
        Array.from({ length: agentActivity?.length }, (_, i) => ({
          mirror: false,
          like: false,
          id: agentActivity[i]?.id,
        }))
      );
    }
  }, [agentActivity]);

  return {
    handlePost,
    postLoading,
    handleComment,
    interactionsLoading,
    handleLike,
    handleMirror,
    handleQuote,
    post,
    setPost,
    commentQuote,
    setCommentQuote,
  };
};

export default useInteractions;
