import request from '@/utils/request'

// 获取学分计划
export function listPlan(query) {
  return request({
    url: '/system/study/plan/list',
    method: 'get',
    params: query
  })
}

// 按条件获取学分计划中的一条
export function getPlan(planId) {
  return request({
    url: '/system/study/plan/selectOne' + planId,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addPlan(data) {
  return request({
    url: '/system/study/plan',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updatePlan(data) {
  return request({
    url: '/system/study/plan',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delPlan(planId) {
  return request({
    url: '/system/study/plan/' + planId,
    method: 'delete'
  })
}
