import { useEffect, useState } from 'react';
import {
  StudyManageButtonWrapper,
  StudyManageContainer,
} from '@src/pages/StudyManage/style';
import { studyManageType } from '@src/interfaces/studyManage';
import { StudyManageMemberControl } from '@src/containers';
import { getStudyManageInfomation } from '@src/apis/studyManage';
import { Button, Typography } from '@mui/material';

function StudyManage() {
  const [data, setData] = useState({} as studyManageType);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getStudyManageInfomation();
      setData(res);
    };

    fetchData();
  }, []);

  const getTopic = () => {
    const { topic = '' } = data;
    return topic;
  };

  const getTitle = () => {
    const { title = '' } = data;
    return title;
  };

  return (
    <StudyManageContainer>
      <div>
        <Typography variant='subtitle2' color='secondary'>
          {getTopic()}
        </Typography>
        <Typography variant='h4'>{getTitle()}</Typography>
      </div>
      <StudyManageButtonWrapper>
        <Button fullWidth>스터디 수정</Button>
        <Button fullWidth color='error'>
          스터디 삭제
        </Button>
      </StudyManageButtonWrapper>
      <StudyManageMemberControl
        numberOfApplicant={data.numberOfApplicant}
        numberOfMembers={data.numberOfMembers}
        numberOfRecruits={data.numberOfRecruits}
        studyMembers={data.studyMembers}
        applicants={data.applicants}
      />
    </StudyManageContainer>
  );
}

export default StudyManage;
