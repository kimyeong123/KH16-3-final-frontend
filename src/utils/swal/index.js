import Swal from "sweetalert2";

export const swalInfo = (title, text) =>
  Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonText: "확인",
  });

export const swalError = (title, text) =>
  Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonText: "확인",
  });

export const swalSuccess = (title, text) =>
  Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonText: "확인",
  });

export const swalConfirm = async (title, text) => {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "확인",
    cancelButtonText: "취소",
  });
  return result.isConfirmed;
};
