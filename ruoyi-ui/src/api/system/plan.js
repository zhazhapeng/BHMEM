import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listPlan(query) {
  return request({
    url: '/system/plan/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getPlan(planId) {
  return request({
    url: '/system/plan/' + planId,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addPlan(data) {
  return request({
    url: '/system/plan',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updatePlan(data) {
  return request({
    url: '/system/plan',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delPlan(planId) {
  return request({
    url: '/system/plan/' + planId,
    method: 'delete'
  })
}
