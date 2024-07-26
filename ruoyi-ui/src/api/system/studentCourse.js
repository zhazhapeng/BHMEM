import request from '@/utils/request'

// 查询【请填写功能名称】列表
export function listCourse(query) {
  return request({
    url: '/system/student/course/choose/list',
    method: 'get',
    params: query
  })
}


export function studentSelfCourse(query) {
  return request({
    url: '/system/student/course/score/list',
    method: 'get',
    params: query
  })
}

// 增加实践记录申请
export function addRecord(data) {
  return request({
    url: '/system/record',
    method: 'post',
    data: data
  })
}

// 查询【请填写功能名称】详细
export function getCourse(courseId) {
  return request({
    url: '/system/student/course/choose/' + courseId,
    method: 'get'
  })
}

// 新增【请填写功能名称】
export function selectCourse(data) {
  return request({    
    url: '/system/student/course/choose',
    method: 'post',
    data: data
  })
}

// 修改【请填写功能名称】
export function updateCourse(data) {
  return request({
    url: '/system/course',
    method: 'put',
    data: data
  })
}

// 删除【请填写功能名称】
export function delCourse(courseId) {
  return request({
    url: '/system/course/' + courseId,
    method: 'delete'
  })
}
