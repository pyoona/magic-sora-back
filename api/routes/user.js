import { Router } from 'express';
import { wrapAsyncError } from '../../library/index.js';
import { UserService } from '../../services/user.js';
import middlewares from '../middlewares/index.js';
const route = Router();
const userServiceInstance = new UserService();

export default app => {
  app.use('/users', route);

  // 프로필 정보 조회
  route.get(
    '/',
    middlewares.isAuth,
    middlewares.getCurrentUserId,
    wrapAsyncError(async (req, res) => {
      const id = req.user_id;
      const user = await userServiceInstance.getUserById(id);

      return res.json(user);
    }),
  );

  // 프로필 정보 수정
  route.patch(
    '/',
    middlewares.isAuth,
    middlewares.getCurrentUserId,
    middlewares.isNicknameExists,
    wrapAsyncError(async (req, res) => {
      const id = req.user_id;
      let { currentPass, newUser } = req.body;
      newUser = await userServiceInstance.updateUser(id, currentPass, newUser);

      return res.json(newUser);
    }),
  );

  // 회원 탈퇴
  route.delete(
    '/',
    middlewares.isAuth,
    middlewares.getCurrentUserId,
    wrapAsyncError(async (req, res) => {
      const id = req.user_id;
      await userServiceInstance.deleteUser(id);

      return res.sendStatus(204);
    }),
  );

  // 비밀번호 재설정 및 재설정 메일 전송
  route.post(
    '/reset-password',
    middlewares.isEmailValid,
    wrapAsyncError(async (req, res) => {
      const user = req.user;
      await userServiceInstance.sendResetPasswordEmail(user);

      return res.sendStatus(200);
    }),
  );

  route.patch(
    '/reset-password',
    middlewares.isUserIdValid,
    wrapAsyncError(async (req, res) => {
      const user = req.user;
      const { code, newPassword } = req.body;
      await userServiceInstance.resetPassword(user, code, newPassword);

      return res.sendStatus(200);
    }),
  );

  // 작성한 고민 조회
  route.get(
    '/myposts',
    middlewares.isAuth,
    middlewares.getCurrentUserId,
    wrapAsyncError(async (req, res) => {
      const id = req.user_id;
      const userPosts = await userServiceInstance.getUserPost(id);

      return res.json(userPosts);
    }),
  );

  // 투표한 고민 조회
  route.get(
    '/myvotes',
    middlewares.isAuth,
    middlewares.getCurrentUserId,
    wrapAsyncError(async (req, res) => {
      const id = req.user_id;
      const votePosts = await userServiceInstance.getVotePost(id);

      return res.json(votePosts);
    }),
  );

  // 관심태그 조회
  route.get(
    '/mytags',
    middlewares.isAuth,
    middlewares.getCurrentUserId,
    wrapAsyncError(async (req, res) => {
      const id = req.user_id;
      const userTags = await userServiceInstance.getUserTag(id);

      return res.json(userTags);
    }),
  );

  // 관심태그 목록 수정
  route.patch(
    '/mytags',
    middlewares.isAuth,
    middlewares.getCurrentUserId,
    wrapAsyncError(async (req, res) => {
      const id = req.user_id;
      const { newTags } = req.body;
      const userTags = await userServiceInstance.updateUserTag(id, newTags);

      return res.json(userTags);
    }),
  );

  // email, 닉네임 중복 조회
  route.get(
    '/nickname-exists',
    middlewares.isNicknameExists,
    wrapAsyncError(async (req, res) => {
      return res.sendStatus(200);
    }),
  );

  route.get(
    '/email-exists',
    middlewares.isEmailExists,
    wrapAsyncError(async (req, res) => {
      return res.sendStatus(200);
    }),
  );
};
