import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listScore(query) {
  return request({
    url: '/system/score/list',
    method: 'get',
    params: query
  })
}

// 查询【请填写功能名称】详细
export function getScore(id) {
  return request({
    url: '/system/score/' + id,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function addScore(data) {
  return request({
    url: '/system/score',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateScore(data) {
  return request({
    url: '/system/score',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delScore(id) {
  return request({
    url: '/system/score/' + id,
    method: 'delete'
  })
}
