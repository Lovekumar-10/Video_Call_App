const JoinRequestPopup = ({ requester, onAccept, onReject }) => {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.56)", // light dark overlay
        zIndex: 1050,
      }}
    >
      <div
        className="bg-white border rounded p-4 shadow-lg text-center"
        style={{ minWidth: "300px" }}
      >
        <h5 className="mb-3">Join Request</h5>
        <p>
          <strong>{requester.name}</strong> wants to join the room.
        </p>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-success" onClick={() => onAccept(requester)}>
            Accept
          </button>
          <button className="btn btn-danger" onClick={() => onReject(requester)}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestPopup;
