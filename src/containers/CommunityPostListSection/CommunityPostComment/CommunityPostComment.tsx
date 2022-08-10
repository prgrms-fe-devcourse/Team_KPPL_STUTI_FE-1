import { useDispatch } from 'react-redux';
import { useRef, useState } from 'react';
import { AxiosError, AxiosResponse } from 'axios';
import {
  addNewComment,
  addComment,
  changeComment,
  deleteComment,
} from '@store/slices/comment';
import { errorType } from '@src/interfaces/error';
import { Typography } from '@mui/material';
import {
  childrenCommentType,
  CommentContentsType,
  CommunityPostCommentType,
} from '@interfaces/community';
import ReplyInput, { errorHandle } from '@containers/Reply/ReplyInput';
import Reply, { inputHandle } from '@containers/Reply/Reply';
import {
  createCommunityPostCommentApi,
  changeCommunityPostCommentApi,
  getCommunityPostCommentApi,
  deleteCommunityPostCommentApi,
} from '@apis/community';

import { PostCommentContainer } from './style';

interface Props extends CommunityPostCommentType {
  size: number;
  postId: number;
  onCount: (commentCountType: string) => void;
}

function CommunityPostComment({
  contents = [],
  totalElements,
  hasNext,
  size,
  postId,
  onCount,
}: Props) {
  const dispatch = useDispatch();
  const [newSize, setNewSize] = useState(size);

  const handleInputError = useRef<errorHandle>(null);
  const handleInput = useRef<inputHandle[]>([]);
  const handleInputSub = useRef<inputHandle[]>([]);

  const requestComment = async (
    postId: number,
    size: number,
    lastCommunityPostCommentId: number,
  ) => {
    try {
      const res: CommunityPostCommentType = await getCommunityPostCommentApi(
        postId,
        size,
        lastCommunityPostCommentId,
      );

      dispatch(addComment(res));
    } catch (error) {
      console.error(error);
      const { response } = error as AxiosError;
      const { data }: { data: errorType } = response as AxiosResponse;
      const { errorCode } = data;
    }
  };

  const createComment = async (
    postId: number,
    parentId: number | null,
    contents: string,
    index: number,
    isDefaultInput?: boolean,
  ) => {
    try {
      const res: CommentContentsType | childrenCommentType =
        await createCommunityPostCommentApi(postId, parentId, contents);
      dispatch(addNewComment(res));

      onCount('UP');
      if (isDefaultInput) {
        handleInputError.current?.resetValue();
        handleInputError.current?.handleErrorFalse();
      } else {
        handleInput.current[index]?.resetValue();
        handleInput.current[index]?.handleCommentFlag();
        handleInput.current[index]?.handleErrorFalse();
      }
    } catch (error) {
      console.error(error);
      const { response } = error as AxiosError;
      const { data }: { data: errorType } = response as AxiosResponse;
      const { errorCode } = data;
      if (isDefaultInput) {
        handleInputError.current?.handleErrorTrue();
      } else {
        handleInput.current[index]?.handleErrorTrue();
      }
    }
  };

  const updateComment = async (
    postId: number,
    postCommentId: number,
    contents: string,
    index: number,
    isSub?: boolean,
  ) => {
    try {
      const res: CommentContentsType | childrenCommentType =
        await changeCommunityPostCommentApi(postId, postCommentId, contents);

      dispatch(changeComment(res));

      if (isSub) {
        handleInputSub.current[index]?.resetValue();
        handleInputSub.current[index]?.handleUpdateFlag();
        handleInputSub.current[index]?.handleErrorFalse();
      } else {
        handleInput.current[index]?.resetValue();
        handleInput.current[index]?.handleUpdateFlag();
        handleInput.current[index]?.handleErrorFalse();
      }
    } catch (error) {
      console.error(error);
      const { response } = error as AxiosError;
      const { data }: { data: errorType } = response as AxiosResponse;
      const { errorCode } = data;

      if (isSub) {
        handleInputSub.current[index]?.handleErrorTrue();
      } else {
        handleInput.current[index]?.handleErrorTrue();
      }
    }
  };

  const removeComment = async (postId: number, postCommentId: number) => {
    try {
      const res: CommentContentsType | childrenCommentType =
        await deleteCommunityPostCommentApi(postId, postCommentId);
      dispatch(deleteComment(res));

      onCount('DOWN');
    } catch (error) {
      console.error(error);
      const { response } = error as AxiosError;
      const { data }: { data: errorType } = response as AxiosResponse;
      const { errorCode } = data;
    }
  };

  return (
    <PostCommentContainer>
      <ReplyInput
        ref={handleInputError}
        isUpdate={false}
        onCreate={async (contents: string) => {
          createComment(postId, null, contents, -1, true);
        }}
      />
      {contents.map((content, index) => {
        const {
          postCommentId,
          profileImageUrl = '',
          nickname = '프룽이',
          contents: text = '참여하고 싶어요!',
          updatedAt = '2022-02-22 10:00:00',
          children = [],
          memberId,
        } = content;
        return (
          <Reply
            ref={(el) => el && (handleInput.current[index] = el)}
            key={content.postCommentId}
            memberId={memberId}
            profileImageUrl={profileImageUrl}
            nickname={nickname}
            contents={text}
            replies={children}
            updatedAt={updatedAt}
            onCreate={(contents: string) => {
              createComment(postId, postCommentId, contents, index);
            }}
            onUpdate={(contents: string) => {
              updateComment(postId, postCommentId, contents, index);
            }}
            onDelete={() => {
              removeComment(postId, postCommentId);
            }}
          >
            {children.map((reply: any, index: any) => {
              const {
                postCommentId,
                profileImageUrl = '',
                nickname = '',
                contents = '',
                updatedAt = '2022-02-22 10:00:00',
              } = reply;
              return (
                <Reply
                  ref={(el) => el && (handleInputSub.current[index] = el)}
                  key={postCommentId}
                  memberId={memberId}
                  profileImageUrl={profileImageUrl}
                  nickname={nickname}
                  contents={contents}
                  updatedAt={updatedAt}
                  onUpdate={(contents: string) => {
                    updateComment(postId, postCommentId, contents, index, true);
                  }}
                  onDelete={() => {
                    removeComment(postId, postCommentId);
                  }}
                />
              );
            })}
          </Reply>
        );
      })}
      {hasNext && (
        <Typography
          color='secondary'
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            const lastQuestion = contents.at(-1);
            if (!lastQuestion) return;
            const postSize = newSize + size;
            setNewSize(postSize);

            const lastCommunityPostCommentId = lastQuestion.postCommentId;
            requestComment(postId, postSize, lastCommunityPostCommentId);
          }}
        >
          댓글 {totalElements - contents.length}개 더 보기
        </Typography>
      )}
    </PostCommentContainer>
  );
}

export default CommunityPostComment;
