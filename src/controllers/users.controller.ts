import e, { Request, Response, NextFunction } from 'express'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  RegisterReqBody,
  LogoutReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  ForgotPasswordReqBody,
  VerifyForgotPasswordReqBody,
  ResetPasswordReqBody,
  UpdateMeReqBody,
  RefreshTokenReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import { usersMessage } from '~/constants/messages'
import databaseService from '~/services/database.services'
import httpStatus from '~/constants/httpStatus'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import { pick } from 'lodash'

export const loginController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id.toString()
  const verify = user.verify
  const result = await usersService.login({ user_id, verify })
  res.json({
    message: usersMessage.LOGIN_SUCCESS,
    result
  })
}

export const oauthController = async (req: Request, res: Response) => {
  const { code } = req.query as { code: string }
  const result = await usersService.oauth(code)
  const urlRedirect = `${process.env.CLIENT_REDIRECT_URI}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.newUser}${result.verify}`
  res.redirect(urlRedirect) // trả về redirect đến client với access_token và refresh_token để fe lưu vào localStorage
  return
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  // khi gọi một hàm bất động bộ thì cần await để chờ nó thực thi xong, vì nếu không chờ nó chỉ là một promise (lời hứa e trao=)))) chứ chưa có gì cả
  const result = await usersService.register(req.body)
  res.status(200).json({
    message: usersMessage.REGISTER_SUCCESS,
    result: result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  await usersService.logout(refresh_token)
  res.json({
    message: usersMessage.LOGOUT_SUCCESS
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  console.log(req.decoded_refresh_token)
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload
  const { refresh_token } = req.body
  const result = await usersService.refreshToken(refresh_token, user_id, verify, exp)
  res.json({
    message: usersMessage.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    res.status(httpStatus.NOT_FOUND).json({
      message: usersMessage.USER_NOT_FOUND
    })
    return
  }

  // nếu có tồn tại user này mà email verify token rỗng thì tức là người dùng này đã xác thực trước đó rồi nên là thông báo thành công
  if (user?.email_verify_token === '') {
    res.json({
      message: usersMessage.EMAIL_ALREADY_VERIFIED_BEFORE
    })
    return
  }

  const result = await usersService.verifyEmail(user_id)
  // sau khi verify thì trả về token để người dùng có thể đăng nhập
  res.json({
    message: usersMessage.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!result) {
    res.status(httpStatus.NOT_FOUND).json({
      message: usersMessage.USER_NOT_FOUND
    })
    return
  }
  // nếu có tồn tại user này mà email verify token rỗng thì tức là người dùng này đã xác thực trước đó rồi nên là thông báo thành công
  if (result?.verify === UserVerifyStatus.Verified) {
    res.json({
      message: usersMessage.EMAIL_ALREADY_VERIFIED_BEFORE
    })
    return
  }

  // nếu chưa xác thực thì gửi lại email xác thực
  const email_verify_token = await usersService.resendEmailVerify(user_id)
  res.json({
    message: usersMessage.RESEND_EMAIL_VERIFY_SUCCESS,
    email_verify_token
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const _id = req.user as User
  const { verify } = req.user as User
  // tạo forgot password token
  const forgot_password_token = await usersService.forgotPassword({ user_id: _id.toString(), verify })
  console.log(forgot_password_token) // giả định người dùng nhận được token này khi bấm vào link trong email(cái này chưa làm)
  res.json({
    message: usersMessage.CHECK_EMAIL_TO_RESET_PASSWORD
  })
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response
) => {
  res.json({
    message: usersMessage.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { password } = req.body
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const result = await usersService.resetPassword(user_id, password)
  res.json({
    message: usersMessage.RESET_PASSWORD_SUCCESS,
    result
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await usersService.getUserInfo(user_id)
  res.json({
    message: usersMessage.GET_USER_PROFILE_SUCCESS,
    result
  })
}

export const getProfileController = async (req: Request, res: Response) => {
  const { username } = req.params
  const result = await usersService.getProfile(username)
  res.json({
    message: usersMessage.GET_USER_INFO_SUCCESS,
    result
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const body = req.body
  const result = await usersService.updateUserInfo(user_id, body)
  res.json({
    message: usersMessage.UPDATE_USER_INFO_SUCCESS,
    result
  })
}

export const followUserController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.body

  const follower = await databaseService.followers.findOne({
    user_id: new ObjectId(user_id),
    followed_user_id: new ObjectId(followed_user_id as string)
  })
  if (follower) {
    res.json({
      message: usersMessage.FOLLOWED
    })
    return
  }
  await usersService.follow(user_id, followed_user_id)
  res.json({
    message: usersMessage.FOLLOW_USER_SUCCESS
  })
}

export const unfollowUserController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { followed_user_id } = req.params

  const follower = await databaseService.followers.findOne({
    user_id: new ObjectId(user_id),
    followed_user_id: new ObjectId(followed_user_id as string)
  })
  if (!follower) {
    res.json({
      message: usersMessage.UNFOLLOWED
    })
    return
  }

  await usersService.unfollow(user_id, followed_user_id)
  res.json({
    message: usersMessage.UNFOLLOW_USER_SUCCESS
  })
}

export const changePasswordController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { password } = req.body
  const result = await usersService.changePassword(user_id, password)
  res.json({
    message: usersMessage.CHANGE_PASSWORD_SUCCESS,
    result
  })
}
