import Swal from 'sweetalert2';

export const showConfirm = async (options: {
  title?: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: 'warning' | 'error' | 'success' | 'info' | 'question';
}): Promise<boolean> => {
  const result = await Swal.fire({
    title: options.title || 'Are you sure?',
    text: options.text,
    icon: options.icon || 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#64748b',
    confirmButtonText: options.confirmButtonText || 'Yes, proceed',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    reverseButtons: true,
    focusCancel: true,
    customClass: {
      popup: 'rounded-2xl shadow-2xl font-sans',
      confirmButton: 'rounded-xl px-4 py-2 font-semibold text-xs',
      cancelButton: 'rounded-xl px-4 py-2 font-semibold text-xs',
    },
  });

  return result.isConfirmed;
};

export const showAlert = (options: {
  title?: string;
  text: string;
  icon?: 'warning' | 'error' | 'success' | 'info';
}) => {
  return Swal.fire({
    title: options.title || '',
    text: options.text,
    icon: options.icon || 'info',
    confirmButtonColor: '#0284c7',
    customClass: {
      popup: 'rounded-2xl shadow-2xl font-sans',
      confirmButton: 'rounded-xl px-4 py-2 font-semibold text-xs',
    },
  });
};

export default Swal;
