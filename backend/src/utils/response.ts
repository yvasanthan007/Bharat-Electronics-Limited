export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const successResponse = <T>(
  data: T,
  message: string = 'Success'
): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
  };
};

export const errorResponse = (
  message: string,
  errors: any[] = []
): ApiResponse<null> => {
  return {
    success: false,
    message,
    errors,
  };
};
