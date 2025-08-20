export const isPositiveInt = (v) =>
  Number.isInteger(Number(v)) && Number(v) > 0

export const successResponse = (res, data = null, message = null, statusCode = 200) => {
  const response = { error: false }

  if (message) response.msg = message
  if (data) response.data = data

  return res.status(statusCode).json(response)
}