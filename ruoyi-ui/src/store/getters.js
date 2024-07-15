const baseRouter = [
    {
      "name": "Edu",
      "path": "/bhMem",
      "hidden": false,
      "redirect": "noRedirect",
      "component": "Layout",
      "alwaysShow": true,
      "meta": {
          "title": "学分计划管理",
          "icon": "education",
          "noCache": false,
          "link": null
      },
      "children": [
          // {
          //     "name": "Plan",
          //     "path": "plan",
          //     "hidden": false,
          //     "component": "ParentView",
          //     "meta": {
          //         "title": "学分计划",
          //         "icon": "education",
          //         "noCache": false,
          //         "link": null
          //     }
          // },
          {
              "name": "Course",
              "path": "course",
              "hidden": false,
              // "component": "ParentView",
              "meta": {
                  "title": "课程管理",
                  "icon": 'education',
                  "noCache": false,
                  "link": null
              }
          },
          // {
          //     "name": "Course/select",
          //     "path": "course/select",
          //     "hidden": false,
          //     "component": "ParentView",
          //     "meta": {
          //         "title": "学生选课",
          //         "icon": "education",
          //         "noCache": false,
          //         "link": null
          //     }
          // },
          {
              "name": "Apply",
              "path": "record",
              "hidden": false,
              "component":  () => import('@/views/record'),
              "meta": {
                  "title": "实践记录",
                  "icon": "education",
                  "noCache": false,
                  "link": null
              }
          },
          // {
          //     "name": "Approval",
          //     "path": "approval",
          //     "hidden": false,
          //     "component": "ParentView",
          //     "meta": {
          //         "title": "实践记录审批",
          //         "icon": "education",
          //         "noCache": false,
          //         "link": null
          //     }
          // },
          {
              "name": "Score",
              "path": "score",
              "hidden": false,
              "component": import('@/views/score'),
              "meta": {
                  "title": "学分汇总记录",
                  "icon": "education",
                  "noCache": false,
                  "link": null
              }
          }
      ]
  }
];

const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  dict: state => state.dict.dict,
  visitedViews: state => state.tagsView.visitedViews,
  cachedViews: state => state.tagsView.cachedViews,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  introduction: state => state.user.introduction,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  permission_routes: state => state.permission.routes,
  topbarRouters:state => state.permission.topbarRouters,
  defaultRoutes:state => state.permission.defaultRoutes,
  sidebarRouters:state => state.permission.sidebarRouters,
  // sidebarRouters:()=> baseRouter,
}
export default getters
