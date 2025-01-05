import { LensConnected } from "@/components/Common/types/common.types";
import {
  PageSize,
  Post,
  PostReferenceType,
  PublicClient,
} from "@lens-protocol/client";
import { useEffect, useState } from "react";
import fetchPostReferences from "../../../../graphql/lens/queries/postReferences";
import { STORAGE_NODE } from "@/lib/constants";
import fetchPost from "../../../../graphql/lens/queries/post";

const usePost = (
  lensConnected: LensConnected | undefined,
  lensClient: PublicClient,
  postId: string
) => {
  const [postData, setPostData] = useState<Post[]>([]);
  const [activity, setActivity] = useState<Post[]>([]);
  const [activityLoading, setActivityLoading] = useState<boolean>(false);
  const [postDataLoading, setPostDataLoading] = useState<boolean>(false);
  const [activityCursor, setActivityCursor] = useState<string | undefined>();

  const handleActivity = async (reset: boolean) => {
    if (!postId) return;
    setActivityLoading(true);
    try {
      const postsRes = await fetchPostReferences(
        {
          pageSize: PageSize.Fifty,
          referencedPost: postId,
          referenceTypes: [
            PostReferenceType.CommentOn,
            PostReferenceType.QuoteOf,
          ],
        },
        lensConnected?.sessionClient || lensClient
      );

      let posts: Post[] = [];

      if ((postsRes as any)?.items?.length > 0) {
        posts = (postsRes as any)?.items;
      }
      if ((postsRes as any)?.pageInfo?.next) {
        setActivityCursor((postsRes as any)?.pageInfo?.next);
      }

      posts = await Promise.all(
        posts?.map(async (post) => {
          let picture = post?.author?.metadata?.picture;

          if (post?.author?.metadata?.picture) {
            const cadena = await fetch(
              `${STORAGE_NODE}/${
                post?.author?.metadata?.picture?.split("lens://")?.[1]
              }`
            );

            if (cadena) {
              const json = await cadena.json();
              picture = json.item;
            }
          }

          return {
            ...post,
            author: {
              ...post?.author,
              metadata: {
                ...post?.author?.metadata,
                picture,
              },
            },
          } as Post;
        })
      );
      setActivity(posts);
    } catch (err: any) {
      console.error(err.message);
    }
    setActivityLoading(false);
  };

  const handleMoreActivity = async () => {
    if (!activityCursor || !postId) return;
    try {
      const postsRes = await fetchPostReferences(
        {
          pageSize: PageSize.Fifty,
          referencedPost: postId,
          referenceTypes: [
            PostReferenceType.CommentOn,
            PostReferenceType.QuoteOf,
          ],
          cursor: activityCursor,
        },
        lensConnected?.sessionClient || lensClient
      );

      let posts: Post[] = [];

      if ((postsRes as any)?.items?.length > 0) {
        posts = (postsRes as any)?.items;
      }
      if ((postsRes as any)?.pageInfo?.next) {
        setActivityCursor((postsRes as any)?.pageInfo?.next);
      }

      posts = await Promise.all(
        posts?.map(async (post) => {
          let picture = post?.author?.metadata?.picture;

          if (post?.author?.metadata?.picture) {
            const cadena = await fetch(
              `${STORAGE_NODE}/${
                post?.author?.metadata?.picture?.split("lens://")?.[1]
              }`
            );

            if (cadena) {
              const json = await cadena.json();
              picture = json.item;
            }
          }

          return {
            ...post,
            author: {
              ...post?.author,
              metadata: {
                ...post?.author?.metadata,
                picture,
              },
            },
          } as Post;
        })
      );

      setActivity([...activity, ...posts]);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handlePostData = async () => {
    setPostDataLoading(true);
    try {
      const res = await fetchPost(
        {
          post: postId,
        },
        lensConnected?.sessionClient || lensClient
      );

      await handleActivity(false);

      setPostData([res]);
    } catch (err: any) {
      console.error(err.message);
    }
    setPostDataLoading(false);
  };

  useEffect(() => {
    if (lensClient || lensConnected?.sessionClient) {
      handlePostData();
    }
  }, [lensConnected, lensClient]);


  return {
    postData,
    handleActivity,
    activity,
    activityCursor,
    activityLoading,
    postDataLoading,
    handleMoreActivity,
    setActivity,
    setPostData
  };
};

export default usePost;
