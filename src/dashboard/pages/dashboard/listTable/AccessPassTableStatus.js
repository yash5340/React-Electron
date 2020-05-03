import React from 'react';
import { Typography, Button } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Cancel as CancelIcon, CheckCircle as CheckCircleIcon } from '@material-ui/icons';

import { theme } from '../../../../theme';
import { ApprovalStatus, ApprovalStatusLabel } from '../../../../common/constants';

import { AccessPassTableStatusWrapper } from './accessPassTableStatus/AccessPassTableStatusWrapper';

const renderAccessPassOptions = (status, onApproveClick, onDenyClick, onSuspendClick, loading) => {
  switch (status) {
    case ApprovalStatus.Pending:
      return (
        <>
          <ApproveButton variant="contained" onClick={onApproveClick} disabled={loading}>
            Approve
          </ApproveButton>
          <DenyButton variant="contained" onClick={() => onDenyClick()} disabled={loading}>
            Deny
          </DenyButton>
        </>
      );
    case ApprovalStatus.Approved:
      return (
        <>
          <CheckCircleIcon color="inherit" />
          <Typography variant="body1">{ApprovalStatusLabel[status]}</Typography>
          {/* <SuspendButton variant="contained" onClick={onSuspendClick} disabled={loading}>
            Revoke
          </SuspendButton> */}
        </>
      );
    case ApprovalStatus.Declined:
      return (
        <>
          <CancelIcon color="inherit" />
          <Typography variant="body1">{ApprovalStatusLabel[status]}</Typography>
        </>
      );
    case ApprovalStatus.Suspended:
      return (
        <>
          <CancelIcon color="inherit" />
          <Typography variant="body1">{ApprovalStatusLabel[status]}</Typography>
        </>
      );
    default:
      return null;
  }
};

export const AccessPassTableStatus = ({
  status,
  onApproveClick,
  onDenyClick,
  onSuspendClick,
  loading,
}) => {
  return (
    <AccessPassTableStatusWrapper status={status}>
      {renderAccessPassOptions(status, onApproveClick, onDenyClick, onSuspendClick, loading)}
    </AccessPassTableStatusWrapper>
  );
};

AccessPassTableStatus.propTypes = {
  status: PropTypes.string.isRequired,
  onApproveClick: PropTypes.func.isRequired,
  onDenyClick: PropTypes.func.isRequired,
  onSuspendClick: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

AccessPassTableStatus.defaultProps = {
  loading: false,
};

const ApproveButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.approvalGreen,
  '&:hover': {
    backgroundColor: theme.palette.approvalGreen,
  },
}));

const DenyButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.denialRed,
  '&:hover': {
    backgroundColor: theme.palette.denialRed,
  },
}));

const SuspendButton = styled(Button)({
  backgroundColor: theme.palette.suspendOrange,
  '&:hover': {
    backgroundColor: theme.palette.suspendOrange,
  },
});