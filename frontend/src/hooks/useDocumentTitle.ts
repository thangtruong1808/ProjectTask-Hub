import { useEffect } from 'react'

export const APP_NAME = 'ProjectTask-Hub'

export const PAGE_TITLES = {
  signIn: 'SignIn',
  createAccount: 'CreateAccount',
  resetPassword: 'ResetPassword',
  setNewPassword: 'SetNewPassword',
  tasks: 'Tasks',
  myProfile: 'MyProfile',
  projects: 'Projects',
  dashboardOverview: 'Dashboard',
  userManagement: 'UserManagement',
  auditLog: 'AuditLog',
} as const

export type PageTitleKey = keyof typeof PAGE_TITLES

function formatDocumentTitle(pageTitle: string, isLoading: boolean) {
  return isLoading
    ? `Loading… | ${pageTitle} | ${APP_NAME}`
    : `${pageTitle} | ${APP_NAME}`
}

export function useDocumentTitle(pageTitle: string, isLoading = false) {
  useEffect(() => {
    document.title = formatDocumentTitle(pageTitle, isLoading)

    return () => {
      document.title = APP_NAME
    }
  }, [pageTitle, isLoading])
}

export function usePageDocumentTitle(pageKey: PageTitleKey, isLoading = false) {
  useDocumentTitle(PAGE_TITLES[pageKey], isLoading)
}
